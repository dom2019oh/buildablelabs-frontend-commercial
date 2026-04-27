import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  ArrowUp,
  ShieldAlert,
  Map,
  Layers,
  Zap,
  Globe,
  BrainCog,
  FolderCode,
  Paperclip,
  X,
} from 'lucide-react';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from '@/components/ui/prompt-input';
import { toast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { API_BASE } from '@/lib/urls';

// =============================================================================
// SENSITIVE DATA DETECTION
// =============================================================================
const SENSITIVE_PATTERNS: RegExp[] = [
  /[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/,  // Discord bot token
  /sk-[a-zA-Z0-9]{20,}/,                                          // OpenAI / generic sk- key
  /ghp_[a-zA-Z0-9]{36,}/,                                         // GitHub PAT
  /AIza[0-9A-Za-z_-]{35}/,                                        // Google API key
  /[A-Za-z0-9+/]{40,}={0,2}(?:\s|$)/,                           // Base64 blob (40+ chars)
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, // JWT
];

function detectSensitiveData(text: string): boolean {
  return SENSITIVE_PATTERNS.some(p => p.test(text));
}

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
  icon: React.ComponentType<{ className?: string }>;
  toggleIcon: React.ComponentType<{ className?: string }>;
  toggleColor: string;
}> = {
  plan: {
    label: 'Plan',
    description: 'AI maps out the approach without writing code',
    color: '#3b82f6',
    glowHsl: '217 91 60',
    glowColors: ['#3b82f6', '#60a5fa', '#818cf8'],
    placeholder: 'Describe what to plan…',
    icon: Map,
    toggleIcon: Globe,
    toggleColor: '#1EAEDB',
  },
  architect: {
    label: 'Architect',
    description: 'AI designs system architecture with diagrams',
    color: '#f97316',
    glowHsl: '25 95 53',
    glowColors: ['#f97316', '#fb923c', '#fbbf24'],
    placeholder: 'Describe the architecture to design…',
    icon: Layers,
    toggleIcon: BrainCog,
    toggleColor: '#8B5CF6',
  },
  build: {
    label: 'Build',
    description: 'AI generates and writes code directly',
    color: '#22c55e',
    glowHsl: '142 71 45',
    glowColors: ['#22c55e', '#4ade80', '#34d399'],
    placeholder: 'Ask Buildable…',
    icon: Zap,
    toggleIcon: FolderCode,
    toggleColor: '#F97316',
  },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function CustomDivider() {
  return (
    <div className="flex items-center justify-center" style={{ width: 10, height: 26, flexShrink: 0 }}>
      <div
        style={{
          width: 1,
          height: 14,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18), transparent)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            width: 4,
            height: 4,
            background: 'rgba(255,255,255,0.18)',
          }}
        />
      </div>
    </div>
  );
}

function GeneratingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 2, marginLeft: 1, verticalAlign: 'middle' }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

function VoiceRecorderDisplay({ time }: { time: number }) {
  const BAR_COUNT = 12;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              width: 3,
              borderRadius: 2,
              background: '#ef4444',
              transformOrigin: 'bottom',
            }}
            animate={{ height: [6, 8 + Math.random() * 16, 6] }}
            transition={{
              duration: 0.5 + Math.random() * 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 13, color: '#f87171', fontFamily: FONT, fontVariantNumeric: 'tabular-nums' }}>
        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
      </span>
    </div>
  );
}

// =============================================================================
// PROPS
// =============================================================================

interface ChatInputV2Props {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  isChatting?: boolean;
  onStop?: () => void;
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  projectId: string;
  onOpenHistory?: () => void;
  onOpenGitHub?: () => void;
  prefillPrompt?: string;
  generatingPhase?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatInputV2({
  onSend,
  isSending,
  isChatting = false,
  onStop,
  mode,
  onModeChange,
  projectId,
  prefillPrompt,
  generatingPhase,
}: ChatInputV2Props) {
  const [input, setInput] = useState('');
  const hasSensitiveData = useMemo(() => detectSensitiveData(input), [input]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefillPrompt) {
      setInput(prefillPrompt);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [prefillPrompt]);

  // ── File handling ─────────────────────────────────────────────────────────

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFiles(prev => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreviews(prev => ({ ...prev, [file.name]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    picked.forEach(processFile);
    e.target.value = '';
  };

  const handleRemoveFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    setFilePreviews(prev => { const next = { ...prev }; delete next[name]; return next; });
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!input.trim() || isSending) return;
    if (hasSensitiveData) {
      toast({
        title: 'Sensitive data blocked',
        description: 'Keep tokens and API keys in the Cloud tab — never paste them in chat.',
        variant: 'destructive',
      });
      return;
    }
    const content = input.trim();
    setInput('');
    await onSend(content);
  };

  // ── Voice recording ───────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch {
      toast({ title: 'Microphone access denied', description: 'Please allow microphone access to use voice input.', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
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
        project_id: projectId, user_id: currentUser.uid, audio_url: audioUrl,
        duration_seconds: recordingTime, status: 'processing', created_at: serverTimestamp(),
      });
      const token = await currentUser.getIdToken();
      const sttRes = await fetch(`${API_BASE}/api/speech-to-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ audioUrl }),
      });
      if (!sttRes.ok) throw new Error('Speech-to-text failed');
      const sttData = await sttRes.json();
      if (sttData?.transcription) {
        setInput(prev => prev + (prev ? ' ' : '') + sttData.transcription);
        toast({ title: 'Voice transcribed', description: 'Your message has been added to the input.' });
      }
      setAudioBlob(null);
      setRecordingTime(0);
    } catch (error) {
      toast({ title: 'Transcription failed', description: error instanceof Error ? error.message : 'Could not process audio', variant: 'destructive' });
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const cancelRecording = () => { setAudioBlob(null); setRecordingTime(0); };

  // ── Mode cycling ──────────────────────────────────────────────────────────

  const MODES: WorkspaceMode[] = ['plan', 'architect', 'build'];
  const cycleMode = () => {
    const idx = MODES.indexOf(mode);
    onModeChange(MODES[(idx + 1) % MODES.length]);
  };

  const currentMode = MODE_CONFIG[mode];
  const canSend = !!input.trim() && !isSending && !hasSensitiveData;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="p-3"
      style={{ background: '#0c0c0c' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Audio preview */}
      {audioBlob && !isRecording && (
        <div className="mb-2 p-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 flex-1" />
          <button
            onClick={processAudioWithSTT}
            disabled={isProcessingAudio}
            className="h-8 px-3 rounded text-xs font-medium transition-opacity"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {isProcessingAudio ? 'Processing…' : 'Transcribe'}
          </button>
          <button
            onClick={cancelRecording}
            className="h-8 w-8 flex items-center justify-center rounded"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sensitive data warning */}
      {hasSensitiveData && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 10, padding: '8px 12px', marginBottom: 8 }}>
          <ShieldAlert style={{ width: 14, height: 14, color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: FONT }}>
            Credential detected. Keep bot tokens and API keys in the <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Cloud</strong> tab — never paste them in chat.
          </span>
        </div>
      )}

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-3 z-50 flex items-center justify-center rounded-3xl pointer-events-none"
            style={{ border: '2px dashed rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: FONT, fontSize: 14 }}>Drop image here</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating panel — expands upward */}
      <AnimatePresence>
        {(isSending || isChatting) && (
          <motion.div
            key="generating-panel"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ marginBottom: 6 }}
          >
            <div
              style={{
                background: '#1F2023',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              {/* Left: pulse dot + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {/* Animated pulse dot */}
                <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                  <motion.div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: '#a78bfa',
                    }}
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#a78bfa' }} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontFamily: FONT }}>
                    Generating
                  </span>
                  <GeneratingDots />
                  {generatingPhase && (
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={generatingPhase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontFamily: FONT, marginLeft: 8 }}
                      >
                        {generatingPhase}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Right: Stop button */}
              {onStop && (
                <button
                  onClick={onStop}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)',
                    color: '#f87171',
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: FONT,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                >
                  <Square style={{ width: 10, height: 10, fill: '#f87171' }} />
                  Stop
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PromptInput */}
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isSending}
        onSubmit={handleSubmit}
        style={{
          borderRadius: '24px',
          background: '#1F2023',
          border: `1px solid ${hasSensitiveData ? 'rgba(239,68,68,0.4)' : '#444444'}`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.24)',
        } as React.CSSProperties}
      >
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {files.map(file => (
              <div key={file.name} className="relative group" style={{ width: 56, height: 56 }}>
                <img
                  src={filePreviews[file.name]}
                  alt={file.name}
                  className="w-full h-full object-cover rounded-lg"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <button
                  onClick={() => handleRemoveFile(file.name)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#ef4444' }}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea / Voice recorder */}
        {isRecording ? (
          <VoiceRecorderDisplay time={recordingTime} />
        ) : (
          <PromptInputTextarea
            ref={textareaRef}
            placeholder={currentMode.placeholder}
            disabled={isSending}
            maxRows={6}
            className="px-4 pt-3 pb-2 placeholder:text-white/20 min-h-[44px]"
            style={{ color: 'rgba(255,255,255,0.85)', fontFamily: FONT }}
          />
        )}

        {/* Hidden file input */}
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />

        <PromptInputActions className="justify-between pt-1 pb-1 px-1">
          {/* Left: Paperclip + mode toggles */}
          <div className="flex items-center">
            {/* Paperclip */}
            <PromptInputAction tooltip="Attach image" side="top">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="flex items-center justify-center transition-colors"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  color: 'rgba(255,255,255,0.45)',
                  background: 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
            </PromptInputAction>

            <CustomDivider />

            {/* Plan toggle (Globe) */}
            <ModeToggleButton
              modeKey="plan"
              currentMode={mode}
              onClick={cycleMode}
            />

            <CustomDivider />

            {/* Architect toggle (BrainCog) */}
            <ModeToggleButton
              modeKey="architect"
              currentMode={mode}
              onClick={cycleMode}
            />

            <CustomDivider />

            {/* Build toggle (FolderCode) */}
            <ModeToggleButton
              modeKey="build"
              currentMode={mode}
              onClick={cycleMode}
            />
          </div>

          {/* Right: Mic / Send */}
          <div className="flex items-center gap-1.5">
            {/* Voice / Stop recording */}
            <PromptInputAction tooltip={isRecording ? 'Stop recording' : 'Voice input'} side="top">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSending || isProcessingAudio}
                className="flex items-center justify-center transition-colors"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  color: isRecording ? '#f87171' : 'rgba(255,255,255,0.45)',
                  background: isRecording ? 'rgba(239,68,68,0.15)' : 'transparent',
                }}
                onMouseEnter={e => { if (!isRecording) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; } }}
                onMouseLeave={e => { if (!isRecording) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
              >
                {isRecording ? <Square className="h-3 w-3" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
            </PromptInputAction>

            {/* Send */}
            <PromptInputAction tooltip={isSending ? 'Generating…' : 'Send'} side="top">
              <button
                onClick={handleSubmit}
                disabled={!canSend}
                style={{
                  width: 29,
                  height: 29,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  background: canSend
                    ? 'rgba(255,255,255,0.92)'
                    : hasSensitiveData
                    ? 'rgba(239,68,68,0.2)'
                    : 'rgba(255,255,255,0.08)',
                  color: canSend ? '#0c0c0c' : hasSensitiveData ? '#f87171' : 'rgba(255,255,255,0.25)',
                  border: hasSensitiveData ? '1px solid rgba(239,68,68,0.4)' : 'none',
                  cursor: canSend ? 'pointer' : 'not-allowed',
                }}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </PromptInputAction>
          </div>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}

// =============================================================================
// MODE TOGGLE BUTTON
// =============================================================================

function ModeToggleButton({
  modeKey,
  currentMode,
  onClick,
}: {
  modeKey: WorkspaceMode;
  currentMode: WorkspaceMode;
  onClick: () => void;
}) {
  const cfg = MODE_CONFIG[modeKey];
  const Icon = cfg.toggleIcon;
  const isActive = currentMode === modeKey;

  return (
    <PromptInputAction tooltip={cfg.label} side="top">
      <motion.button
        onClick={onClick}
        layout
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          height: 28,
          paddingLeft: isActive ? 9 : 7,
          paddingRight: isActive ? 9 : 7,
          borderRadius: 8,
          background: isActive ? `${cfg.toggleColor}18` : 'transparent',
          border: isActive ? `1px solid ${cfg.toggleColor}40` : '1px solid transparent',
          color: isActive ? cfg.toggleColor : 'rgba(255,255,255,0.40)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <Icon className="h-[13px] w-[13px] flex-shrink-0" />
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              key="label"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                color: cfg.toggleColor,
                overflow: 'hidden',
                display: 'block',
              }}
            >
              {cfg.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </PromptInputAction>
  );
}
