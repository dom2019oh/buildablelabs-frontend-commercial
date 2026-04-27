import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, FileCode2, ThumbsUp, ThumbsDown, Copy, Check, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectMessage } from '@/hooks/useProjectMessages';
import MarkdownRenderer from './MarkdownRenderer';
import ChatInputV2, { type WorkspaceMode } from './ChatInputV2';
import type { GenerationPhase } from '@/hooks/useBuildableAI';

const F = "'Geist', 'DM Sans', sans-serif";

// ─── Message metadata tooltip ─────────────────────────────────────────────────
function MetaTooltip({ message }: { message: ProjectMessage }) {
  const durationMs = message.metadata?.durationMs as number | undefined;
  const creditsUsed = message.metadata?.creditsUsed as number | undefined;

  const parts: string[] = [];
  if (creditsUsed !== undefined) {
    parts.push(creditsUsed === 0 ? 'No credits' : `${creditsUsed} credit${creditsUsed !== 1 ? 's' : ''}`);
  }
  if (durationMs !== undefined && durationMs > 0) {
    const secs = (durationMs / 1000).toFixed(1);
    parts.push(`${secs}s`);
  }

  if (parts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
        background: '#1e1e1e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 7, padding: '5px 9px',
        whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 50,
        fontSize: 11.5, color: 'rgba(255,255,255,0.55)',
        fontFamily: F, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {parts.join(' · ')}
    </motion.div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({
  icon: Icon,
  onClick,
  active = false,
  activeColor,
  title,
}: {
  icon: React.ElementType;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 24, height: 24, borderRadius: 5,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: active ? (activeColor ?? 'rgba(255,255,255,0.7)') : 'rgba(255,255,255,0.25)',
        transition: 'color 0.1s, background 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
    >
      <Icon style={{ width: 13, height: 13 }} />
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChatPanelV2Props {
  messages: ProjectMessage[];
  isLoading: boolean;
  isSending: boolean;
  isChatting?: boolean;
  isStreaming?: boolean;
  streamingMetadata?: { modelUsed?: string; taskType?: string };
  onSendMessage: (content: string, mode: WorkspaceMode) => Promise<void>;
  projectName: string;
  projectId: string;
  lastError?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  currentActions?: string[];
  onOpenHistory?: () => void;
  onOpenGitHub?: () => void;
  prefillPrompt?: string;
  phase?: GenerationPhase;
  filesDelivered?: number;
  filePaths?: string[];
  onCancel?: () => void;
}

export default function ChatPanelV2({
  messages,
  isLoading,
  isSending,
  isChatting = false,
  isStreaming = false,
  onSendMessage,
  projectName,
  projectId,
  lastError = null,
  currentActions = [],
  onOpenHistory,
  onOpenGitHub,
  prefillPrompt,
  phase,
  filesDelivered = 0,
  filePaths = [],
  onCancel,
}: ChatPanelV2Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<WorkspaceMode>('build');

  // Action state per message
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    await onSendMessage(content, mode);
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const toggleReaction = (id: string, reaction: 'like' | 'dislike') => {
    setReactions(prev => ({ ...prev, [id]: prev[id] === reaction ? null : reaction }));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ background: '#0c0c0c' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full" />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn('max-w-[85%]', message.role === 'user' ? 'ml-auto' : 'mr-auto')}
                onMouseEnter={() => message.role === 'assistant' && setHoveredId(message.id)}
                onMouseLeave={() => { setHoveredId(null); setTooltipId(null); }}
              >
                {/* Message bubble */}
                <div
                  className={message.role === 'user' ? 'rounded-2xl px-4 py-3' : 'px-1 py-1'}
                  style={{
                    background: message.role === 'user' ? 'rgba(255,255,255,0.09)' : 'transparent',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {message.role === 'assistant' && message.metadata?.type === 'file_summary' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <CheckCircle2 style={{ width: 15, height: 15, color: '#22c55e', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontFamily: F }}>
                          {(message.metadata.filesCreated as string[])?.length ?? 0} files generated
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 22 }}>
                        {((message.metadata.filesCreated as string[]) ?? []).map((f: string) => (
                          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FileCode2 style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                            <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono','Fira Mono',monospace", color: 'rgba(255,255,255,0.45)' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : message.role === 'assistant' && message.metadata?.status === 'error' ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                      <XCircle style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,100,100,0.9)', fontFamily: F }}>
                        {message.content}
                      </span>
                    </div>
                  ) : message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} className="text-sm" showThinkingIndicator={false} currentActions={[]} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                </div>

                {/* Timestamp */}
                <div
                  className={cn('text-[10px] mt-1 px-1', message.role === 'user' ? 'text-right' : 'text-left')}
                  style={{ color: 'rgba(255,255,255,0.25)', fontFamily: F }}
                >
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Action row — assistant messages only */}
                {message.role === 'assistant' && (
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      paddingLeft: 4, marginTop: 3,
                      opacity: hoveredId === message.id ? 1 : 0,
                      transition: 'opacity 0.15s',
                      pointerEvents: hoveredId === message.id ? 'auto' : 'none',
                    }}
                  >
                    <ActionBtn
                      icon={ThumbsUp}
                      active={reactions[message.id] === 'like'}
                      activeColor="#22c55e"
                      title="Good response"
                      onClick={() => toggleReaction(message.id, 'like')}
                    />
                    <ActionBtn
                      icon={ThumbsDown}
                      active={reactions[message.id] === 'dislike'}
                      activeColor="#ef4444"
                      title="Bad response"
                      onClick={() => toggleReaction(message.id, 'dislike')}
                    />
                    <ActionBtn
                      icon={copiedId === message.id ? Check : Copy}
                      active={copiedId === message.id}
                      activeColor="#3b82f6"
                      title="Copy message"
                      onClick={() => handleCopy(message.id, message.content)}
                    />

                    {/* ... tooltip trigger */}
                    <div style={{ position: 'relative' }}>
                      <ActionBtn
                        icon={MoreHorizontal}
                        active={tooltipId === message.id}
                        title="Usage info"
                        onClick={() => setTooltipId(id => id === message.id ? null : message.id)}
                      />
                      <AnimatePresence>
                        {tooltipId === message.id && <MetaTooltip message={message} />}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Pulsing dots — chat thinking OR generation */}
        <AnimatePresence>
          {(isChatting || isSending || isStreaming) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mr-auto px-1 py-2"
              style={{ display: 'flex', flexDirection: 'column', gap: 5 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                    style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.55)' }}
                  />
                ))}
              </div>
              {(isSending || isStreaming) && phase?.message && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phase.message}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: F }}
                  >
                    {phase.message}
                  </motion.span>
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent error */}
        <AnimatePresence>
          {lastError && !isSending && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mr-auto max-w-[85%]"
            >
              <div className="rounded-2xl px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {lastError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <ChatInputV2
        onSend={handleSend}
        isSending={isSending}
        isChatting={isChatting}
        onStop={onCancel}
        mode={mode}
        onModeChange={setMode}
        projectId={projectId}
        onOpenHistory={onOpenHistory}
        onOpenGitHub={onOpenGitHub}
        prefillPrompt={prefillPrompt}
        generatingPhase={phase?.message}
      />
    </div>
  );
}
