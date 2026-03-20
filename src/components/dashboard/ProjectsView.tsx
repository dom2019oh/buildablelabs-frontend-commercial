import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader2, Bot, Sparkles, ArrowUp,
  Search, SlidersHorizontal, Wifi, WifiOff, Hammer, RefreshCw,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import NewBotGuide from './NewBotGuide';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'online' | 'building' | 'offline';

interface Props {
  showNew?: boolean;
  onShowNewChange?: (v: boolean) => void;
}

export default function ProjectsView({ showNew: externalShowNew, onShowNewChange }: Props = {}) {
  const { projects, isLoading, createProject, createPending, duplicateProject, deleteProject } = useProjects();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [internalShowNew, setInternalShowNew] = useState(false);
  const [duplicatingId,   setDuplicatingId]   = useState<string | null>(null);
  const [deletingId,      setDeletingId]       = useState<string | null>(null);
  const [filter,          setFilter]           = useState<Filter>('all');
  const [search,          setSearch]           = useState('');
  const [quickPrompt,     setQuickPrompt]      = useState('');
  const [promptOpen,      setPromptOpen]       = useState(false);
  const [focused,         setFocused]          = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const showNew    = externalShowNew !== undefined ? externalShowNew : internalShowNew;
  const setShowNew = (v: boolean) => { setInternalShowNew(v); onShowNewChange?.(v); };

  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'there';

  // Auto-grow prompt textarea
  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [quickPrompt]);

  // Focus textarea when prompt opens
  useEffect(() => {
    if (promptOpen) setTimeout(() => promptRef.current?.focus(), 50);
  }, [promptOpen]);

  const handleSubmit = async () => {
    if (!quickPrompt.trim() || createPending) return;
    try {
      const { id } = await createProject(quickPrompt.trim().slice(0, 60), { prompt: quickPrompt.trim() });
      navigate(`/dashboard/project/${id}`);
    } catch (e) { console.error(e); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
    if (e.key === 'Escape') setPromptOpen(false);
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id); try { await duplicateProject(id); } finally { setDuplicatingId(null); }
  };
  const handleDelete = async (id: string) => {
    setDeletingId(id); try { await deleteProject(id); } finally { setDeletingId(null); }
  };

  // Filter + search
  const visible = projects.filter(p => {
    if (filter === 'online'   && p.status !== 'ready')    return false;
    if (filter === 'building' && p.status !== 'building') return false;
    if (filter === 'offline'  && p.status !== 'failed')   return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const online   = projects.filter(p => p.status === 'ready').length;
  const building = projects.filter(p => p.status === 'building').length;
  const offline  = projects.filter(p => p.status === 'failed').length;

  // ── No bots yet → onboarding view ──────────────────────────────────────────
  if (!isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Bot className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.88)' }}>
            No bots in your fleet yet
          </h1>
          <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
            Describe what your Discord bot should do — Buildable AI writes the code, deploys it, and keeps it running.
          </p>

          {/* Inline prompt */}
          <div className="w-full max-w-lg mx-auto">
            <div
              className="rounded-2xl transition-all duration-300"
              style={{
                padding: '1px',
                background: focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                boxShadow: focused ? '0 0 0 3px rgba(255,255,255,0.05)' : '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div className="rounded-[calc(1rem-1px)]" style={{ background: 'rgba(14,13,18,0.9)', backdropFilter: 'blur(32px)' }}>
                <div className="px-4 pt-4 pb-2">
                  <textarea
                    ref={promptRef}
                    value={quickPrompt}
                    onChange={e => setQuickPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="e.g. A moderation bot with auto-ban, warn commands, and a mute system…"
                    rows={2}
                    className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed placeholder:text-white/20"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.85)', minHeight: '52px', maxHeight: '140px', overflow: 'auto' }}
                  />
                </div>
                <div className="flex items-center justify-between px-3 pb-3">
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Sans', sans-serif" }}>Enter to build · Shift+Enter for new line</span>
                  <button
                    onClick={handleSubmit}
                    disabled={!quickPrompt.trim() || createPending}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: quickPrompt.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)', cursor: quickPrompt.trim() ? 'pointer' : 'default' }}
                  >
                    {createPending
                      ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0e0d12' }} />
                      : <ArrowUp className="w-4 h-4" style={{ color: quickPrompt.trim() ? '#0e0d12' : 'rgba(255,255,255,0.25)' }} />
                    }
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs mt-4 mb-3" style={{ color: 'rgba(255,255,255,0.22)', fontFamily: "'DM Sans', sans-serif" }}>or start from a template</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.slice(0, 6).map(t => (
                <button
                  key={t.name}
                  onClick={() => { setQuickPrompt(`Create a ${t.name.toLowerCase()}`); promptRef.current?.focus(); }}
                  className="rounded-xl text-left transition-all overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                >
                  {t.banner ? (
                    <div className="h-10 w-full" style={{ backgroundImage: `url(${t.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ) : (
                    <div className="h-10 w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  )}
                  <div className="px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[11.5px] font-medium truncate block" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.72)' }}>{t.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        <AnimatePresence>{showNew && <NewBotGuide onClose={() => setShowNew(false)} />}</AnimatePresence>
      </div>
    );
  }

  // ── Has bots → Fleet dashboard ─────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen">

      {/* ── Top row: greeting + status chips + new bot ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-[17px] font-bold leading-tight mb-1" style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.88)' }}>
            Bot Fleet
          </h1>
          <p className="text-[13px]" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
            {isLoading ? 'Loading…' : `${projects.length} bot${projects.length === 1 ? '' : 's'} · ${displayName}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status chips */}
          {[
            { icon: Wifi,     color: '#22c55e', count: online,   label: 'Online',   value: 'online'   },
            { icon: Hammer,   color: '#f59e0b', count: building, label: 'Building', value: 'building' },
            { icon: WifiOff,  color: '#6b7280', count: offline,  label: 'Offline',  value: 'offline'  },
          ].map(chip => (
            <button
              key={chip.value}
              onClick={() => setFilter(f => f === chip.value ? 'all' : chip.value as Filter)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: filter === chip.value ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === chip.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
                color: filter === chip.value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
              }}
            >
              <chip.icon className="w-3 h-3" style={{ color: chip.color }} />
              <span className="tabular-nums font-semibold">{chip.count}</span>
              <span className="hidden sm:inline">{chip.label}</span>
            </button>
          ))}

          {/* New Bot */}
          <button
            onClick={() => setPromptOpen(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: promptOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.09)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.82)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = promptOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.09)')}
          >
            <Plus className="w-3.5 h-3.5" />
            New Bot
          </button>
        </div>
      </div>

      {/* ── Inline prompt (collapses when closed) ── */}
      <AnimatePresence>
        {promptOpen && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl transition-all duration-200"
              style={{
                padding: '1px',
                background: focused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
                boxShadow: focused ? '0 0 0 3px rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div className="rounded-[calc(0.75rem-1px)]" style={{ background: 'rgba(14,13,18,0.9)', backdropFilter: 'blur(28px)' }}>
                <div className="px-4 pt-3 pb-1">
                  <textarea
                    ref={promptRef}
                    value={quickPrompt}
                    onChange={e => setQuickPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Describe your new Discord bot…"
                    rows={2}
                    className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed placeholder:text-white/20"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.85)', minHeight: '44px', maxHeight: '140px', overflow: 'auto' }}
                  />
                </div>
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex gap-1.5">
                    {TEMPLATES.slice(0, 4).map(t => (
                      <button
                        key={t.name}
                        onClick={() => { setQuickPrompt(`Create a ${t.name.toLowerCase()}`); promptRef.current?.focus(); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!quickPrompt.trim() || createPending}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: quickPrompt.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)', cursor: quickPrompt.trim() ? 'pointer' : 'default' }}
                  >
                    {createPending
                      ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0e0d12' }} />
                      : <ArrowUp className="w-4 h-4" style={{ color: quickPrompt.trim() ? '#0e0d12' : 'rgba(255,255,255,0.25)' }} />
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search row ── */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '280px' }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.22)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bots…"
            className="bg-transparent outline-none text-[13px] w-full placeholder:text-white/20"
            style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.78)' }}
          />
        </div>

        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[12px] transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <RefreshCw className="w-3 h-3" /> Clear filter
          </button>
        )}
      </div>

      {/* ── Bot grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
            No bots match your filter
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {visible.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
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

          {/* Add new bot card */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setPromptOpen(true)}
            className="rounded-2xl flex flex-col items-center justify-center gap-2 py-12 transition-all group"
            style={{ border: '1px dashed rgba(255,255,255,0.12)', minHeight: '160px' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <Plus className="w-5 h-5 transition-colors" style={{ color: 'rgba(255,255,255,0.22)' }} />
            <span className="text-[12px] transition-colors" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.28)' }}>
              New bot
            </span>
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>{showNew && <NewBotGuide onClose={() => setShowNew(false)} />}</AnimatePresence>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { name: 'Moderation Bot', key: 'moderation', banner: '/templates/moderation.png', desc: 'Auto-mod, warns, bans & mutes'   },
  { name: 'Ticketing Bot',  key: 'ticket',     banner: '/templates/ticket.png',     desc: 'Support ticket system'           },
  { name: 'Community Bot',  key: 'community',  banner: '/templates/community.png',  desc: 'Welcome, roles & announcements' },
  { name: 'AI Chat Bot',    key: 'ai-chat',    banner: '/templates/ai-chat.png',    desc: 'GPT-powered chat assistant'      },
  { name: 'Custom Bot',     key: 'custom',     banner: '/templates/custom.png',     desc: 'Start from a blank slate'        },
  { name: 'Music Bot',      key: 'music',      banner: null,                        desc: 'YouTube & Spotify playback'      },
];
