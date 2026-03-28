import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, ArrowUp, ChevronRight, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProjectCard from './ProjectCard';
import NewBotGuide from './NewBotGuide';
import BorderGlow from '@/components/workspace/BorderGlow';
import { type WorkspaceMode, MODE_CONFIG } from '@/components/workspace/ChatInputV2';

const FONT = "'Geist', 'DM Sans', sans-serif";

type Tab = 'my-bots' | 'recent' | 'templates';

interface Props {
  showNew?: boolean;
  onShowNewChange?: (v: boolean) => void;
}


export default function ProjectsView({ showNew: externalShowNew, onShowNewChange }: Props = {}) {
  const { projects, isLoading, createProject, createPending, duplicateProject, deleteProject } = useProjects();
  const { user, profile } = useAuth();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [internalShowNew,  setInternalShowNew]  = useState(false);
  const [duplicatingId,    setDuplicatingId]    = useState<string | null>(null);
  const [deletingId,       setDeletingId]       = useState<string | null>(null);
  const [activeTab,        setActiveTab]        = useState<Tab>('my-bots');
  const [quickPrompt,      setQuickPrompt]      = useState('');
  const [mode,             setMode]             = useState<WorkspaceMode>('build');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const promptRef      = useRef<HTMLTextAreaElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  const showNew    = externalShowNew !== undefined ? externalShowNew : internalShowNew;
  const setShowNew = (v: boolean) => { setInternalShowNew(v); onShowNewChange?.(v); };

  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'there';

  // Auto-grow textarea
  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [quickPrompt]);

  // Close mode dropdown on outside click
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

  const handleSubmit = async () => {
    if (!quickPrompt.trim() || createPending) return;
    try {
      const { id } = await createProject(quickPrompt.trim().slice(0, 60), { prompt: quickPrompt.trim() });
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
    <div className="h-screen flex flex-col overflow-hidden">

      {/* ── Hero (transparent — Grainient shows through) ────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
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
          <BorderGlow
            backgroundColor="#1a1a1a"
            borderRadius={20}
            glowColor={MODE_CONFIG[mode].glowHsl}
            colors={MODE_CONFIG[mode].glowColors}
            glowRadius={32}
            glowIntensity={0.85}
            coneSpread={20}
            fillOpacity={0.25}
            animated
            style={{ width: '100%' }}
          >
            <div style={{ borderRadius: '19px', background: '#1a1a1a', overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-2">
                <textarea
                  ref={promptRef}
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={MODE_CONFIG[mode].placeholder}
                  rows={2}
                  className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed placeholder:text-white/25"
                  style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.88)', minHeight: '52px', maxHeight: '140px', overflow: 'auto' }}
                />
              </div>
              <div className="flex items-center justify-between px-3 pb-3 gap-2">
                {/* Left: + button */}
                <button
                  onClick={() => setShowNew(true)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Right: Mode dropdown + Send */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Mode button + dropdown */}
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
                          glowColor={MODE_CONFIG[mode].glowHsl}
                          colors={MODE_CONFIG[mode].glowColors}
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
                                onClick={() => { setMode(key); setShowModeDropdown(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left"
                                style={{ background: mode === key ? 'rgba(255,255,255,0.07)' : 'transparent' }}
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
                    <button
                      onClick={() => setShowModeDropdown(v => !v)}
                      className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-lg transition-all"
                      style={{
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: FONT,
                        background: showModeDropdown ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${MODE_CONFIG[mode].color}35`,
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: MODE_CONFIG[mode].color, boxShadow: `0 0 5px ${MODE_CONFIG[mode].color}` }}
                      />
                      Mode
                      <ChevronDown
                        className="w-3 h-3 transition-transform"
                        style={{
                          color: 'rgba(255,255,255,0.35)',
                          transform: showModeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Send button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!quickPrompt.trim() || createPending}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: quickPrompt.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)',
                      cursor: quickPrompt.trim() ? 'pointer' : 'default',
                    }}
                  >
                    {createPending
                      ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0e0d12' }} />
                      : <ArrowUp className="w-4 h-4" style={{ color: quickPrompt.trim() ? '#0e0d12' : 'rgba(255,255,255,0.25)' }} />
                    }
                  </button>
                </div>
              </div>
            </div>
          </BorderGlow>

        </motion.div>
      </div>

      {/* ── Bottom: Tab bar + project grid ─────────────────────── */}
      <div className="px-3 pb-3 flex-shrink-0">
      <div
        style={{
          background: '#0c0c0c',
          border: '1px solid rgb(39,39,37)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2">
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

        {/* Project grid — only expands when there's content */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: tabProjects.length > 0 || activeTab === 'templates' ? '42vh' : '0',
            paddingLeft: tabProjects.length > 0 ? '1.5rem' : 0,
            paddingRight: tabProjects.length > 0 ? '1.5rem' : 0,
            paddingBottom: tabProjects.length > 0 ? '1.5rem' : 0,
            overflow: tabProjects.length > 0 || activeTab === 'templates' ? 'auto' : 'hidden',
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
      </div>
      </div>

      <AnimatePresence>{showNew && <NewBotGuide onClose={() => setShowNew(false)} />}</AnimatePresence>
    </div>
  );
}
