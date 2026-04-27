import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, ArrowUp, ChevronRight, Sparkles, ChevronDown, Check, X, FileText, Image, Paperclip, Square } from 'lucide-react';
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProjectCard from './ProjectCard';
import { type WorkspaceMode, MODE_CONFIG } from '@/components/workspace/ChatInputV2';
import Aurora from '@/components/Aurora';

const FONT = "'Geist', 'DM Sans', sans-serif";

type Tab = 'my-bots' | 'recent' | 'templates';

interface Props {
  showNew?: boolean;
  onShowNewChange?: (v: boolean) => void;
}


export default function ProjectsView(_props: Props = {}) {
  const { projects, isLoading, createProject, createPending, duplicateProject, deleteProject } = useProjects();
  const { user, profile } = useAuth();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [duplicatingId,    setDuplicatingId]    = useState<string | null>(null);
  const [deletingId,       setDeletingId]       = useState<string | null>(null);
  const [activeTab,        setActiveTab]        = useState<Tab>('my-bots');
  const [quickPrompt,      setQuickPrompt]      = useState('');
  const [mode,             setMode]             = useState<WorkspaceMode>('build');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [attachedFiles,    setAttachedFiles]    = useState<Array<{ name: string; size: number; type: string; preview?: string }>>([]);
  const promptRef        = useRef<HTMLTextAreaElement>(null);
  const modeDropdownRef  = useRef<HTMLDivElement>(null);
  const modeButtonRef    = useRef<HTMLButtonElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: 'File too large', description: `${file.name} exceeds 20 MB`, variant: 'destructive' });
        return;
      }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => setAttachedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type, preview: ev.target?.result as string }]);
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type }]);
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (idx: number) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx));

  const fmtSize = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'there';

  // Auto-grow textarea
  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [quickPrompt]);

  // Close mode dropdown on outside click — check both the button wrapper AND the fixed panel
  useEffect(() => {
    if (!showModeDropdown) return;
    const handler = (e: MouseEvent) => {
      const inButton = modeDropdownRef.current?.contains(e.target as Node);
      const inPanel  = dropdownPanelRef.current?.contains(e.target as Node);
      if (!inButton && !inPanel) setShowModeDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModeDropdown]);

  // Compute fixed dropdown position from button rect (avoids overflow:hidden clipping)
  useEffect(() => {
    if (showModeDropdown && modeButtonRef.current) {
      const r = modeButtonRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.top, right: window.innerWidth - r.right });
    } else {
      setDropdownPos(null);
    }
  }, [showModeDropdown]);

  const handleSubmit = async () => {
    if (!quickPrompt.trim() || createPending) return;
    try {
      const fileContext = attachedFiles.length > 0
        ? `\n\n[Attached files: ${attachedFiles.map(f => f.name).join(', ')}]`
        : '';
      const fullPrompt = quickPrompt.trim() + fileContext;
      const { id } = await createProject(fullPrompt.slice(0, 60), { prompt: fullPrompt, mode });
      setAttachedFiles([]);
      navigate(`/dashboard/project/${id}`);
    } catch (e: any) {
      toast({ title: 'Failed to create project', description: e?.message ?? 'Check your connection and try again.', variant: 'destructive' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id); try { await duplicateProject(id); } finally { setDuplicatingId(null); }
  };
  const handleDelete = async (id: string) => {
    setDeletingId(id); try { await deleteProject(id); } finally { setDeletingId(null); }
  };

  // Tab content
  const tabProjects =
    activeTab === 'recent'    ? projects.slice(0, 8) :
    activeTab === 'templates' ? []                   :
    projects;

  return (
    <div style={{ height: '100vh', padding: '10px', boxSizing: 'border-box' as const }}>
    <div style={{ height: '100%', position: 'relative' as const, overflow: 'hidden', borderRadius: '20px', background: '#0a0a0e' }}>

      {/* ── Vapor trail background ───────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', borderRadius: 'inherit' }}>
        <Aurora
            colorStops={['#5b7ef5', '#f97316', '#c026d3']}
            amplitude={1.4}
            blend={0.6}
            speed={0.8}
          />
      </div>

      {/* ── Content layer (scrollable) ───────────────────────── */}
      <div className="dashboard-scroll" style={{ position: 'relative' as const, zIndex: 1, height: '100%', overflowY: 'auto' as const }}>

      {/* ── Hero: centered badge + greeting + prompt ─────────── */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px', minHeight: '55vh' }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <img src="/buildable-ai-icon.png" style={{ width: 16, height: 16 }} />
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: FONT }}>AI Discord bot builder</span>
          <ChevronRight className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </motion.div>

        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-[28px] sm:text-[34px] font-bold text-center mb-8 leading-tight"
          style={{ fontFamily: "'Syne', 'Geist', sans-serif", color: 'rgba(255,255,255,0.92)' }}
        >
          What should we build, {displayName}?
        </motion.h1>

        {/* Prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="w-full max-w-[640px]"
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.json,.csv"
            className="hidden"
            onChange={handleFileSelect}
          />

          <PromptInput
            value={quickPrompt}
            onValueChange={setQuickPrompt}
            isLoading={createPending}
            onSubmit={handleSubmit}
            className="w-full border-0"
            style={{
              borderRadius: '28px',
              background: 'rgba(14,14,16,0.90)',
              border: '1.5px solid rgba(0,0,0,0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Attached file chips */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-2 pt-1 pb-2">
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 pl-1 pr-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '180px' }}
                  >
                    {f.preview
                      ? <img src={f.preview} alt={f.name} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                      : f.type.startsWith('image/')
                        ? <Image className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                        : <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    }
                    <span className="text-[11px] truncate" style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.6)' }}>{f.name}</span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }}>{fmtSize(f.size)}</span>
                    <button onClick={() => removeFile(i)} className="flex-shrink-0 ml-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <PromptInputTextarea
              placeholder={MODE_CONFIG[mode].placeholder}
              className="px-2 text-sm leading-relaxed placeholder:text-white/25 min-h-[52px] max-h-[140px]"
              style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.88)' }}
            />

            <PromptInputActions className="flex items-center justify-between px-1 pb-1 pt-1">
              {/* Left: attach */}
              <PromptInputAction tooltip="Attach files (max 20 MB)" side="top">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </PromptInputAction>

              {/* Right: mode + send */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mode button — cycles through modes on click, no dropdown */}
                <button
                  onClick={() => {
                    const modes: WorkspaceMode[] = ['build', 'plan', 'architect'];
                    setMode(modes[(modes.indexOf(mode) + 1) % modes.length]);
                  }}
                  className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-xl transition-all"
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: FONT,
                    fontWeight: 500,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  {(() => { const Icon = MODE_CONFIG[mode].icon; return <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.55)' }} />; })()}
                  <span>{MODE_CONFIG[mode].label}</span>
                </button>

                {/* Send */}
                <PromptInputAction tooltip={createPending ? 'Stop' : 'Send message'} side="top">
                  <button
                    onClick={handleSubmit}
                    disabled={!quickPrompt.trim() || createPending}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: quickPrompt.trim() ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)',
                      cursor: quickPrompt.trim() ? 'pointer' : 'default',
                    }}
                  >
                    {createPending
                      ? <Square className="w-3.5 h-3.5 fill-current" style={{ color: '#0e0d12' }} />
                      : <ArrowUp className="w-4 h-4" style={{ color: quickPrompt.trim() ? '#0e0d12' : 'rgba(255,255,255,0.25)' }} />
                    }
                  </button>
                </PromptInputAction>
              </div>
            </PromptInputActions>
          </PromptInput>

        </motion.div>
      </div>{/* end hero section */}

      {/* ── Projects floating card at bottom ─────────────────── */}
      <div style={{
        margin: '0 12px 12px',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(10,10,12,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
      <div>
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2" style={{ flexShrink: 0 }}>
          {([
            { id: 'my-bots',   label: 'My Projects'      },
            { id: 'recent',    label: 'Recently Viewed'  },
            { id: 'templates', label: 'Templates'        },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="relative px-3 py-1.5 rounded-lg text-[13px]"
              style={{
                fontFamily: FONT,
                color: activeTab === t.id ? 'rgb(252,251,248)' : 'rgb(120,116,110)',
                transition: 'color 0.2s',
              }}
            >
              {activeTab === t.id && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgb(30,30,30)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => navigate('/dashboard/templates')}
            className="flex items-center gap-1 text-[12px] transition-all"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: FONT }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            Browse all
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project grid */}
        <div
          style={{
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingBottom: '1.5rem',
          }}
        >
          {activeTab === 'templates' ? (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: FONT }}>
                Browse templates to get started quickly.
              </p>
              <button
                onClick={() => navigate('/dashboard/templates')}
                className="mt-3 text-[13px] px-4 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.72)', fontFamily: FONT }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              >
                View Templates
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
          ) : tabProjects.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: FONT }}>
                {activeTab === 'recent' ? 'No recently viewed bots.' : 'No bots yet — describe one above to get started.'}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2"
            >
              {tabProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ProjectCard
                    id={project.id}
                    name={project.name}
                    status={project.status}
                    updatedAt={project.updated_at}
                    template={project.template}
                    language={project.language}
                    onDuplicate={() => handleDuplicate(project.id)}
                    onDelete={() => handleDelete(project.id)}
                    isDuplicating={duplicatingId === project.id}
                    isDeleting={deletingId === project.id}
                  />
                </motion.div>
              ))}

              {/* Add new card */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => promptRef.current?.focus()}
                className="rounded-2xl flex flex-col items-center justify-center gap-2 py-12 transition-all"
                style={{ border: '1px dashed rgba(255,255,255,0.1)', minHeight: '160px' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <Plus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <span className="text-[12px]" style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.25)' }}>New bot</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>{/* end inner flex */}
      </div>{/* end projects card */}

      </div>{/* end content layer */}
    </div>{/* end rounded card */}
    </div>
  );
}
