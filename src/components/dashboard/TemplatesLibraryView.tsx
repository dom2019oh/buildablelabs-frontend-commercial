import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Shield, Music2, CreditCard, Sparkles, Laugh,
  Wrench, Users, TrendingUp, Ticket, Bell, ImageIcon,
  Gift, BarChart2, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';

const FONT = "'Geist', 'DM Sans', sans-serif";

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',        label: 'All' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'music',      label: 'Music' },
  { id: 'economy',    label: 'Economy' },
  { id: 'ai',         label: 'AI' },
  { id: 'fun',        label: 'Fun' },
  { id: 'utility',    label: 'Utility' },
  { id: 'community',  label: 'Community' },
];

// ── Template data ─────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'auto-moderator',
    name: 'Auto Moderator',
    category: 'moderation',
    description: 'Keeps your server clean with automated spam detection, word filters, anti-raid protection, and configurable auto-punishments.',
    features: ['Spam filter', 'Word blacklist', 'Anti-raid', 'Auto-ban/mute'],
    icon: Shield,
    color: '#f87171',
    bg: 'rgba(239,68,68,0.12)',
    gradient: 'from-red-900/60 via-zinc-900 to-red-950/40',
    popular: true,
    complexity: 'Intermediate',
  },
  {
    id: 'music-dj',
    name: 'Music DJ',
    category: 'music',
    description: 'Full-featured music bot with YouTube & Spotify support, queue management, volume control, and loop/shuffle modes.',
    features: ['YouTube & Spotify', 'Queue system', 'Vote skip', 'Lyrics'],
    icon: Music2,
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.12)',
    gradient: 'from-violet-900/60 via-zinc-900 to-purple-950/40',
    popular: true,
    complexity: 'Advanced',
  },
  {
    id: 'economy-hub',
    name: 'Economy Hub',
    category: 'economy',
    description: 'Full virtual economy with coins, daily rewards, a shop, item inventory, gambling mini-games, and a rich leaderboard.',
    features: ['Daily rewards', 'Shop & items', 'Gambling', 'Leaderboard'],
    icon: CreditCard,
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.12)',
    gradient: 'from-amber-900/60 via-zinc-900 to-yellow-950/40',
    popular: true,
    complexity: 'Advanced',
  },
  {
    id: 'ai-companion',
    name: 'AI Companion',
    category: 'ai',
    description: 'Conversational AI assistant powered by Claude. Answers questions, explains topics, summarises channels, and remembers context.',
    features: ['Claude AI', 'Memory', 'Channel summary', 'Custom persona'],
    icon: Sparkles,
    color: '#34d399',
    bg: 'rgba(16,185,129,0.12)',
    gradient: 'from-emerald-900/60 via-zinc-900 to-teal-950/40',
    popular: true,
    complexity: 'Intermediate',
  },
  {
    id: 'trivia-master',
    name: 'Trivia Master',
    category: 'fun',
    description: 'Multi-category trivia game with timed rounds, score tracking, difficulty levels, and head-to-head challenge mode.',
    features: ['10+ categories', 'Timed rounds', 'Score tracking', 'Challenges'],
    icon: Laugh,
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.12)',
    gradient: 'from-orange-900/60 via-zinc-900 to-red-950/40',
    popular: false,
    complexity: 'Beginner',
  },
  {
    id: 'ticket-system',
    name: 'Ticket System',
    category: 'utility',
    description: 'Professional support ticket system with categories, staff assignment, transcript logging, and auto-close on inactivity.',
    features: ['Categories', 'Staff assign', 'Transcripts', 'Auto-close'],
    icon: Ticket,
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.12)',
    gradient: 'from-blue-900/60 via-zinc-900 to-sky-950/40',
    popular: false,
    complexity: 'Intermediate',
  },
  {
    id: 'welcome-bot',
    name: 'Welcome & Goodbye',
    category: 'community',
    description: 'Greets new members with a custom embed, assigns default roles, sends a DM with server rules, and logs departures.',
    features: ['Custom embeds', 'Auto-roles', 'DM on join', 'Leave log'],
    icon: Users,
    color: '#f472b6',
    bg: 'rgba(236,72,153,0.12)',
    gradient: 'from-pink-900/60 via-zinc-900 to-rose-950/40',
    popular: false,
    complexity: 'Beginner',
  },
  {
    id: 'leveling-xp',
    name: 'Leveling & XP',
    category: 'community',
    description: 'Reward active members with XP for chatting. Unlock role rewards at milestones, view rank cards, and top the leaderboard.',
    features: ['XP & levels', 'Role rewards', 'Rank cards', 'Leaderboard'],
    icon: TrendingUp,
    color: '#34d399',
    bg: 'rgba(16,185,129,0.12)',
    gradient: 'from-teal-900/60 via-zinc-900 to-green-950/40',
    popular: true,
    complexity: 'Intermediate',
  },
  {
    id: 'reminder-bot',
    name: 'Reminder & Scheduler',
    category: 'utility',
    description: 'Set personal or server-wide reminders, schedule recurring announcements, and create countdowns to events.',
    features: ['Personal reminders', 'Recurring posts', 'Countdowns', 'Timezones'],
    icon: Bell,
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.12)',
    gradient: 'from-indigo-900/60 via-zinc-900 to-violet-950/40',
    popular: false,
    complexity: 'Beginner',
  },
  {
    id: 'image-generator',
    name: 'AI Image Generator',
    category: 'ai',
    description: 'Generate stunning images from text prompts using DALL-E 3. Set styles, aspect ratios, and share directly to channels.',
    features: ['DALL-E 3', 'Style presets', 'Aspect ratios', 'Gallery'],
    icon: ImageIcon,
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
    gradient: 'from-purple-900/60 via-zinc-900 to-fuchsia-950/40',
    popular: false,
    complexity: 'Intermediate',
  },
  {
    id: 'giveaway-bot',
    name: 'Giveaway Bot',
    category: 'fun',
    description: 'Host timed giveaways with reaction entry, multiple winners, role-restricted entries, and automatic winner announcements.',
    features: ['Timed draws', 'Multi-winner', 'Role restrict', 'Reroll'],
    icon: Gift,
    color: '#f9a8d4',
    bg: 'rgba(249,168,212,0.12)',
    gradient: 'from-rose-900/60 via-zinc-900 to-pink-950/40',
    popular: false,
    complexity: 'Beginner',
  },
  {
    id: 'server-stats',
    name: 'Server Analytics',
    category: 'utility',
    description: 'Live stat channels showing member count, online users, message activity, and daily growth. Full activity dashboard.',
    features: ['Stat channels', 'Activity graphs', 'Join/leave log', 'Top channels'],
    icon: BarChart2,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
    gradient: 'from-sky-900/60 via-zinc-900 to-cyan-950/40',
    popular: false,
    complexity: 'Beginner',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function TemplatesLibraryView() {
  const [search, setSearch]         = useState('');
  const [activeCategory, setActive] = useState('all');
  const [creating, setCreating]     = useState<string | null>(null);
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { createProject } = useProjects();

  const filtered = TEMPLATES.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleUse = async (t: typeof TEMPLATES[number]) => {
    if (!user) { navigate('/login'); return; }
    setCreating(t.id);
    try {
      const prompt = `Build me a Discord bot using the "${t.name}" template. ${t.description} Key features to include: ${t.features.join(', ')}.`;
      const { id } = await createProject(t.name, { prompt, template: t.id });
      navigate(`/dashboard/project/${id}`);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div style={{ fontFamily: FONT }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.92)' }}>
          Bot Templates
        </h1>
        <p className="text-[13.5px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Start with a pre-built bot and customise it — or use it as inspiration for your prompt.
        </p>
      </div>

      {/* ── Search + filters ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.28)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full pl-9 pr-4 py-2 text-[13px] rounded-xl outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.82)',
              fontFamily: FONT,
            }}
            onFocus={e  => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.18)')}
            onBlur={e   => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)')}
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all"
              style={{
                background: activeCategory === cat.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeCategory === cat.id ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                color: activeCategory === cat.id ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.42)',
                fontFamily: FONT,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => {
          const Icon = t.icon;
          const isBusy = creating === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.13)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Colour accent strip */}
              <div className="h-[2px] w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${t.color}80, transparent 70%)` }} />

              {/* Preview area */}
              <div className={`h-[88px] w-full bg-gradient-to-br ${t.gradient} flex items-center justify-center relative flex-shrink-0`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: t.bg, border: `1px solid ${t.color}30` }}>
                  <Icon className="w-5 h-5" style={{ color: t.color }} />
                </div>
                {t.popular && (
                  <span
                    className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}
                  >
                    Popular
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-col gap-3 p-4 flex-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[14px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.90)', fontFamily: FONT }}>
                      {t.name}
                    </h3>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>
                      {t.complexity}
                    </span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: FONT }}>
                    {t.description}
                  </p>
                </div>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-1.5">
                  {t.features.map(f => (
                    <span
                      key={f}
                      className="text-[11px] px-2 py-0.5 rounded-md"
                      style={{ background: `${t.color}14`, border: `1px solid ${t.color}28`, color: t.color, fontFamily: FONT }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <button
                onClick={() => handleUse(t)}
                disabled={isBusy}
                className="flex items-center justify-between px-4 py-2.5 transition-all w-full"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '12px',
                  fontFamily: FONT,
                  background: 'transparent',
                  cursor: isBusy ? 'wait' : 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${t.color}12`;
                  e.currentTarget.style.color = t.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                }}
              >
                <span>{isBusy ? 'Creating…' : 'Use template'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Search className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>No templates match "{search}"</p>
        </div>
      )}
    </div>
  );
}
