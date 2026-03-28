import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'moderation',
    emoji: '🔨',
    name: 'Moderation Bot',
    desc: 'Kick, ban, mute, warnings, auto-mod, log channels',
    tags: ['kick', 'ban', 'warnings', 'automod'],
    color: '#ef4444',
  },
  {
    id: 'music',
    emoji: '🎵',
    name: 'Music Bot',
    desc: 'Play, queue, skip, shuffle, now playing with rich embeds',
    tags: ['play', 'queue', 'skip', 'shuffle'],
    color: '#8b5cf6',
  },
  {
    id: 'economy',
    emoji: '💰',
    name: 'Economy Bot',
    desc: 'Balance, daily rewards, shop, leaderboard, gambling',
    tags: ['balance', 'daily', 'shop', 'leaderboard'],
    color: '#f59e0b',
  },
  {
    id: 'leveling',
    emoji: '⬆️',
    name: 'Leveling Bot',
    desc: 'XP system, level-up roles, rank cards, leaderboard',
    tags: ['xp', 'rank', 'levels', 'roles'],
    color: '#10b981',
  },
  {
    id: 'ticket',
    emoji: '🎫',
    name: 'Ticket Bot',
    desc: 'Support tickets, staff channels, transcripts, close/reopen',
    tags: ['tickets', 'support', 'staff', 'transcripts'],
    color: '#3b82f6',
  },
  {
    id: 'welcome',
    emoji: '👋',
    name: 'Welcome Bot',
    desc: 'Welcome & goodbye messages, auto-roles, member count',
    tags: ['welcome', 'goodbye', 'autorole'],
    color: '#ec4899',
  },
  {
    id: 'utility',
    emoji: '🔧',
    name: 'Utility Bot',
    desc: 'Server info, polls, reminders, weather, role management',
    tags: ['info', 'polls', 'reminders', 'roles'],
    color: '#6366f1',
  },
  {
    id: 'custom',
    emoji: '✨',
    name: 'Custom Bot',
    desc: 'Describe exactly what your bot should do from scratch',
    tags: ['anything', 'custom', 'unique'],
    color: 'rgba(255,255,255,0.4)',
    custom: true,
  },
];

const LANGUAGES = [
  { id: 'python',     label: 'Python',     sub: 'discord.py',     badge: '#3572A5' },
  { id: 'javascript', label: 'JavaScript', sub: 'discord.js v14', badge: '#f1e05a' },
  { id: 'typescript', label: 'TypeScript', sub: 'discord.js v14', badge: '#3178c6' },
];

const COMMAND_STYLES = [
  { id: 'prefix', label: 'Prefix commands', example: '!play, !ban, !balance' },
  { id: 'slash',  label: 'Slash commands',  example: '/play, /ban, /balance' },
  { id: 'both',   label: 'Both',            example: '!play  and  /play' },
];

// ─── Slide animation ──────────────────────────────────────────────────────────

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center:              { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { onClose: () => void; }

export default function NewBotGuide({ onClose }: Props) {
  const { createProject } = useProjects();

  const [step, setStep]         = useState(0); // 0=template 1=details 2=review
  const [dir,  setDir]          = useState(1);
  const [template, setTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [description, setDescription] = useState('');
  const [botName,   setBotName]   = useState('');
  const [language,  setLanguage]  = useState('python');
  const [cmdStyle,  setCmdStyle]  = useState('prefix');
  const [creating,  setCreating]  = useState(false);

  const totalSteps = 3;

  function go(n: number) {
    setDir(n > step ? 1 : -1);
    setStep(n);
  }

  function selectTemplate(t: typeof TEMPLATES[0]) {
    setTemplate(t);
    if (!botName && !t.custom) setBotName(`My ${t.name}`);
    go(1);
  }

  async function handleBuild() {
    if (!botName.trim() || !template) return;
    setCreating(true);
    const prompt = template.custom
      ? description
      : `Build a ${template.name} for Discord. ${description ? `Additional requirements: ${description}` : `Include the standard features: ${template.tags.join(', ')}.`}`;
    await createProject(botName.trim(), { template: template.id, language, commandStyle: cmdStyle, prompt });
    onClose();
  }

  const canProceedStep1 = !!template;
  const canProceedStep2 = botName.trim().length > 0 && (!template?.custom || description.trim().length > 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{
          background: '#0c0c10',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
          maxHeight: '90vh',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" style={{ color: 'rgba(160,140,255,0.7)' }} />
              <span className="text-xs tracking-widest uppercase"
                style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.28)' }}>
                New Bot — Step {step + 1} of {totalSteps}
              </span>
            </div>
            <h2 className="text-lg font-bold"
              style={{ fontFamily: "'Geist', sans-serif", color: 'rgba(255,255,255,0.9)' }}>
              {step === 0 && 'What kind of bot are you building?'}
              {step === 1 && 'Configure your bot'}
              {step === 2 && 'Review & start building'}
            </h2>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? '20px' : '6px',
                    height: '6px',
                    background: i < step
                      ? 'rgba(40,200,80,0.7)'
                      : i === step
                        ? 'rgba(160,140,255,0.85)'
                        : 'rgba(255,255,255,0.12)',
                  }} />
              ))}
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Step content ── */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <AnimatePresence mode="wait" custom={dir}>

            {/* ── STEP 0: Template picker ── */}
            {step === 0 && (
              <motion.div key="step0" custom={dir} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="p-7 grid grid-cols-2 md:grid-cols-4 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => selectTemplate(t)}
                    className="group relative rounded-xl p-4 text-left transition-all duration-200 flex flex-col gap-2"
                    style={{
                      background: template?.id === t.id ? 'rgba(160,140,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${template?.id === t.id ? 'rgba(160,140,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                    onMouseEnter={e => {
                      if (template?.id !== t.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (template?.id !== t.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      }
                    }}>
                    {/* Selected check */}
                    {template?.id === t.id && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(160,140,255,0.85)' }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl">{t.emoji}</span>
                    <div className="text-sm font-semibold"
                      style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.85)' }}>
                      {t.name}
                    </div>
                    <div className="text-xs leading-relaxed"
                      style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.38)' }}>
                      {t.desc}
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {t.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)',
                            fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* ── STEP 1: Details ── */}
            {step === 1 && (
              <motion.div key="step1" custom={dir} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="p-7 flex flex-col gap-6">

                {/* Selected template pill */}
                {template && (
                  <div className="flex items-center gap-2 text-sm"
                    style={{ fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
                    <span>{template.emoji}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{template.name}</span>
                    <button onClick={() => go(0)}
                      className="text-xs underline underline-offset-2"
                      style={{ color: 'rgba(160,140,255,0.6)' }}>change</button>
                  </div>
                )}

                {/* Bot name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-wide uppercase"
                    style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                    Bot name
                  </label>
                  <input
                    autoFocus
                    value={botName}
                    onChange={e => setBotName(e.target.value)}
                    placeholder="e.g. Modbot, MusicBot, ServerHelper"
                    className="rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: 'rgba(255,255,255,0.85)',
                      fontFamily: "'Geist', 'DM Sans', sans-serif",
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(160,140,255,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                {/* Description — always shown for custom, optional for templates */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-wide uppercase"
                    style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                    {template?.custom ? 'Describe your bot *' : 'Anything specific to add? (optional)'}
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={template?.custom
                      ? 'Describe exactly what your bot should do, what commands it needs, how it should behave...'
                      : `Any extra features, specific commands, or custom behaviour for your ${template?.name}...`}
                    rows={4}
                    className="rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: 'rgba(255,255,255,0.85)',
                      fontFamily: "'Geist', 'DM Sans', sans-serif",
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(160,140,255,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                {/* Language */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-wide uppercase"
                    style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                    Language
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l.id} onClick={() => setLanguage(l.id)}
                        className="rounded-xl px-4 py-3 text-left transition-all"
                        style={{
                          background: language === l.id ? 'rgba(160,140,255,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${language === l.id ? 'rgba(160,140,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        }}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: l.badge }} />
                          <span className="text-sm font-semibold"
                            style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.85)' }}>
                            {l.label}
                          </span>
                        </div>
                        <div className="text-xs pl-4"
                          style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
                          {l.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Command style */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-wide uppercase"
                    style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                    Command style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COMMAND_STYLES.map(c => (
                      <button key={c.id} onClick={() => setCmdStyle(c.id)}
                        className="rounded-xl px-4 py-3 text-left transition-all"
                        style={{
                          background: cmdStyle === c.id ? 'rgba(160,140,255,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${cmdStyle === c.id ? 'rgba(160,140,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        }}>
                        <div className="text-sm font-medium mb-0.5"
                          style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.82)' }}>
                          {c.label}
                        </div>
                        <div className="text-[11px]"
                          style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)' }}>
                          {c.example}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Review ── */}
            {step === 2 && (
              <motion.div key="step2" custom={dir} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="p-7 flex flex-col gap-5">

                <p className="text-sm" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.45)' }}>
                  Buildable AI will generate your bot based on the spec below. You can refine anything afterwards in the workspace.
                </p>

                {/* Summary card */}
                <div className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { label: 'Bot name',       value: botName },
                    { label: 'Template',       value: `${template?.emoji} ${template?.name}` },
                    { label: 'Language',       value: LANGUAGES.find(l => l.id === language)?.label + ' (' + LANGUAGES.find(l => l.id === language)?.sub + ')' },
                    { label: 'Commands',       value: COMMAND_STYLES.find(c => c.id === cmdStyle)?.label },
                    ...(description ? [{ label: 'Extra requirements', value: description }] : []),
                  ].map((row, i, arr) => (
                    <div key={row.label} className="flex gap-4 px-5 py-3.5"
                      style={{
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}>
                      <span className="text-xs w-36 flex-shrink-0 pt-0.5"
                        style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.28)' }}>
                        {row.label}
                      </span>
                      <span className="text-sm"
                        style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.75)' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* What happens next */}
                <div className="rounded-xl px-5 py-4"
                  style={{ background: 'rgba(160,140,255,0.06)', border: '1px solid rgba(160,140,255,0.12)' }}>
                  <p className="text-xs mb-2" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(160,140,255,0.7)' }}>
                    What happens next
                  </p>
                  {[
                    'Buildable AI plans your bot architecture',
                    `Generates production-ready ${LANGUAGES.find(l => l.id === language)?.label} code`,
                    'Opens your workspace — you can chat with AI to refine it',
                    'Connect your Bot Token when ready to go live',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs mb-1.5"
                      style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.45)' }}>
                      <span className="mt-px w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                        style={{ background: 'rgba(160,140,255,0.2)', color: 'rgba(160,140,255,0.8)' }}>
                        {i + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer nav ── */}
        <div className="flex items-center justify-between px-7 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0e0e13' }}>
          <button
            onClick={() => go(step - 1)}
            className="flex items-center gap-2 text-sm transition-opacity"
            style={{
              fontFamily: "'Geist', 'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.35)',
              opacity: step === 0 ? 0 : 1,
              pointerEvents: step === 0 ? 'none' : 'auto',
            }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => go(step + 1)}
              disabled={step === 0 ? !canProceedStep1 : !canProceedStep2}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                background: (step === 0 ? canProceedStep1 : canProceedStep2)
                  ? 'rgba(160,140,255,0.85)' : 'rgba(255,255,255,0.07)',
                color: (step === 0 ? canProceedStep1 : canProceedStep2)
                  ? '#fff' : 'rgba(255,255,255,0.25)',
                cursor: (step === 0 ? canProceedStep1 : canProceedStep2) ? 'pointer' : 'not-allowed',
              }}>
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleBuild}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                background: creating ? 'rgba(160,140,255,0.4)' : 'rgba(160,140,255,0.85)',
                color: '#fff',
                cursor: creating ? 'wait' : 'pointer',
              }}>
              {creating ? (
                <>
                  <motion.div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  Starting build...
                </>
              ) : (
                <><Sparkles className="w-4 h-4" /> Start Building</>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
