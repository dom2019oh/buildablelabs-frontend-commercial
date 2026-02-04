import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Mic, 
  MicOff,
  Image,
  Github,
  History,
  Settings,
  Loader2,
  Square
} from 'lucide-react';
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

interface ChatInputV2Props {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  isPlanMode: boolean;
  onPlanModeChange: (enabled: boolean) => void;
  projectId: string;
}

export default function ChatInputV2({
  onSend,
  isSending,
  isPlanMode,
  onPlanModeChange,
  projectId,
}: ChatInputV2Props) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // TODO: Upload to Supabase and process with STT
        toast({
          title: 'Recording saved',
          description: `Recorded ${recordingTime}s of audio. STT processing coming soon.`,
        });
        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-3 bg-zinc-900 border-t border-zinc-800">
      <div className="flex items-end gap-2">
        {/* Plus Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 bg-zinc-800 hover:bg-zinc-700 flex-shrink-0"
            >
              <Plus className="h-4 w-4 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48 bg-zinc-900 border-zinc-700">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Image className="h-4 w-4" />
              Attach image
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Github className="h-4 w-4" />
              GitHub
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-700" />
            <DropdownMenuItem className="gap-2 cursor-pointer">
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

        {/* Input Area */}
        <div className="flex-1 relative bg-zinc-800 rounded-xl border border-zinc-700 focus-within:border-zinc-600 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPlanMode ? "Describe what to plan..." : "Ask Buildable..."}
            rows={1}
            disabled={isSending || isRecording}
            className="w-full bg-transparent resize-none text-sm placeholder:text-zinc-500 focus:outline-none min-h-[44px] max-h-[150px] py-3 px-4 pr-24"
          />
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-400">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {/* Plan Mode Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 px-3 font-medium flex-shrink-0 transition-colors",
                isPlanMode 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-foreground"
              )}
              onClick={() => onPlanModeChange(!isPlanMode)}
            >
              Plan
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Plan mode: AI won't commit changes without approval</p>
          </TooltipContent>
        </Tooltip>

        {/* Voice Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 flex-shrink-0",
                isRecording 
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSending}
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
          className="h-9 w-9 bg-white hover:bg-zinc-200 flex-shrink-0"
          onClick={handleSend}
          disabled={!input.trim() || isSending}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
          ) : (
            <Send className="h-4 w-4 text-zinc-500" />
          )}
        </Button>
      </div>
    </div>
  );
}
