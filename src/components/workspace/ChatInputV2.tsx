import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Mic,
  Image,
  Github,
  History,
  Settings,
  Loader2,
  Square,
  ArrowUp,
  ChevronDown,
  Check,
} from 'lucide-react';
import BorderGlow from './BorderGlow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { auth, db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { API_BASE } from '@/lib/urls';

// =============================================================================
// WORKSPACE MODE
// =============================================================================

export type WorkspaceMode = 'plan' | 'architect' | 'build';

const FONT = "'Geist', 'DM Sans', sans-serif";

export const MODE_CONFIG: Record<WorkspaceMode, {
  label: string;
  description: string;
  color: string;
  glowHsl: string;
  glowColors: string[];
  placeholder: string;
}> = {
  plan: {
    label: 'Plan',
    description: 'AI maps out the approach without writing code',
    color: '#3b82f6',
    glowHsl: '217 91 60',
    glowColors: ['#3b82f6', '#60a5fa', '#818cf8'],
    placeholder: 'Describe what to plan…',
  },
  architect: {
    label: 'Architect',
    description: 'AI designs system architecture with diagrams',
    color: '#f97316',
    glowHsl: '25 95 53',
    glowColors: ['#f97316', '#fb923c', '#fbbf24'],
    placeholder: 'Describe the architecture to design…',
  },
  build: {
    label: 'Build',
    description: 'AI generates and writes code directly',
    color: '#22c55e',
    glowHsl: '142 71 45',
    glowColors: ['#22c55e', '#4ade80', '#34d399'],
    placeholder: 'Ask Buildable…',
  },
};

// =============================================================================
// PROPS
// =============================================================================

interface ChatInputV2Props {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  projectId: string;
  onOpenHistory?: () => void;
  onOpenGitHub?: () => void;
}

export default function ChatInputV2({
  onSend,
  isSending,
  mode,
  onModeChange,
  projectId,
  onOpenHistory,
  onOpenGitHub,
}: ChatInputV2Props) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Click outside to close mode dropdown
  useEffect(() => {
    if (!showModeDropdown) return;
    const handler = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModeDropdown]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput('');
    await onSend(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processAudioWithSTT = async () => {
    if (!audioBlob) return;

    setIsProcessingAudio(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      const fileName = `voice-recordings/${projectId}/${Date.now()}.webm`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, audioBlob, { contentType: 'audio/webm' });
      const audioUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'voiceRecordings'), {
        project_id: projectId,
        user_id: currentUser.uid,
        audio_url: audioUrl,
        duration_seconds: recordingTime,
        status: 'processing',
        created_at: serverTimestamp(),
      });

      const token = await currentUser.getIdToken();
      const sttRes = await fetch(`${API_BASE}/api/speech-to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ audioUrl }),
      });

      if (!sttRes.ok) throw new Error('Speech-to-text failed');
      const sttData = await sttRes.json();

      if (sttData?.transcription) {
        setInput(prev => prev + (prev ? ' ' : '') + sttData.transcription);
        toast({
          title: 'Voice transcribed',
          description: 'Your message has been added to the input.',
        });
      }

      setAudioBlob(null);
      setRecordingTime(0);
    } catch (error) {
      console.error('STT error:', error);
      toast({
        title: 'Transcription failed',
        description: error instanceof Error ? error.message : 'Could not process audio',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMode = MODE_CONFIG[mode];

  return (
    <div className="p-3" style={{ background: '#0e0d12', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Audio Preview */}
      {audioBlob && !isRecording && (
        <div className="mb-2 p-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 flex-1" />
          <Button
            size="sm"
            onClick={processAudioWithSTT}
            disabled={isProcessingAudio}
            className="h-8"
          >
            {isProcessingAudio ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Transcribe'
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={cancelRecording}
            className="h-8 text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Input Bar */}
      <div className="rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Text Input Area */}
        <div className="relative px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentMode.placeholder}
            rows={1}
            disabled={isSending || isRecording}
            className="w-full bg-transparent resize-none text-sm placeholder:text-white/20 focus:outline-none min-h-[24px] max-h-[150px]"
            style={{ color: 'rgba(255,255,255,0.85)', fontFamily: FONT }}
          />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-400">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {/* Bottom Controls Row */}
        <div className="flex items-center justify-between px-2 pb-2">
          {/* Left side - Plus menu */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-48" style={{ background: '#13121a', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 32px rgba(0,0,0,0.65)' }}>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Image className="h-4 w-4" />
                  Attach image
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onOpenGitHub?.()}>
                  <Github className="h-4 w-4" />
                  GitHub
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onOpenHistory?.()}>
                  <History className="h-4 w-4" />
                  History
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                  <Link to={`/dashboard/project/${projectId}/settings`}>
                    <Settings className="h-4 w-4" />
                    Project settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1">
            {/* Mode Button + Dropdown */}
            <div className="relative" ref={modeDropdownRef}>
              {/* Dropdown panel */}
              {showModeDropdown && (
                <div
                  className="absolute bottom-full mb-2 right-0 z-50"
                  style={{ width: '230px' }}
                >
                  <BorderGlow
                    backgroundColor="#13121a"
                    borderRadius={14}
                    glowColor={currentMode.glowHsl}
                    colors={currentMode.glowColors}
                    glowRadius={28}
                    glowIntensity={0.9}
                    coneSpread={20}
                    animated
                    style={{ width: '100%' }}
                  >
                    <div style={{ borderRadius: '13px', overflow: 'hidden', background: '#13121a' }}>
                      {(Object.entries(MODE_CONFIG) as [WorkspaceMode, typeof MODE_CONFIG[WorkspaceMode]][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => { onModeChange(key); setShowModeDropdown(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left"
                          style={{
                            background: mode === key ? 'rgba(255,255,255,0.07)' : 'transparent',
                          }}
                          onMouseEnter={e => { if (mode !== key) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { if (mode !== key) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: FONT }}>{cfg.label}</p>
                            <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: FONT }}>{cfg.description}</p>
                          </div>
                          {mode === key && (
                            <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </BorderGlow>
                </div>
              )}

              {/* Mode button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 font-medium transition-all rounded-lg text-sm gap-1.5"
                style={{
                  background: showModeDropdown ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.75)',
                  border: `1px solid ${currentMode.color}35`,
                  fontFamily: FONT,
                }}
                onClick={() => setShowModeDropdown(v => !v)}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: currentMode.color, boxShadow: `0 0 5px ${currentMode.color}` }}
                />
                <span>Mode</span>
                <ChevronDown
                  className="h-3 w-3 transition-transform"
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    transform: showModeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </Button>
            </div>

            {/* Voice Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-lg",
                    isRecording
                      ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      : "hover:bg-white/[0.06]"
                  )}
                  style={!isRecording ? { color: 'rgba(255,255,255,0.4)' } : undefined}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isSending || isProcessingAudio}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? 'Stop recording' : 'Voice input'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Send Button */}
            <Button
              size="icon"
              className="h-8 w-8 rounded-full transition-all"
              style={{
                background: input.trim() && !isSending ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)',
                color: input.trim() && !isSending ? '#0e0d12' : 'rgba(255,255,255,0.25)',
              }}
              onClick={handleSend}
              disabled={!input.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
