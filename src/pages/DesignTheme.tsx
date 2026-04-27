import { useState } from 'react';
import { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import FloatingNav from '@/components/FloatingNav';
import {
  LayoutDashboard, ArrowRight, Zap, Bot, Code2,
  ChevronDown, Loader2, Plus, Rocket, Terminal,
  Sparkles, Send, Check, Music,
} from 'lucide-react';

const F = "'Geist', sans-serif";

// ─── Apple Vision Pro Glass Base ─────────────────────────
const G: CSSProperties = {
  fontFamily: F,
  fontWeight: 500,
  letterSpacing: '-0.015em',
  cursor: 'pointer',
  outline: 'none',
  border: '1px solid rgba(255,255,255,0.165)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  userSelect: 'none',
  position: 'relative',
  overflow: 'hidden',
  // Layered glass:
  background: 'linear-gradient(170deg, rgba(255,255,255,0.135) 0%, rgba(255,255,255,0.065) 100%)',
  backdropFilter: 'blur(24px) saturate(190%)',
  WebkitBackdropFilter: 'blur(24px) saturate(190%)',
  // Outer shadow + inner top highlight + inner bottom shadow
  boxShadow: '0 4px 20px rgba(0,0,0,0.42), inset 0 1.5px 0 rgba(255,255,255,0.21), inset 0 -1px 0 rgba(0,0,0,0.14)',
  color: 'rgba(255,255,255,0.90)',
  transition: 'background 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
};

const TR = { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] };

// Hover/leave for neutral glass
const onGE = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'linear-gradient(170deg, rgba(255,255,255,0.200) 0%, rgba(255,255,255,0.100) 100%)';
  e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.52), inset 0 1.5px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.16)';
};
const onGL = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'linear-gradient(170deg, rgba(255,255,255,0.135) 0%, rgba(255,255,255,0.065) 100%)';
  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.42), inset 0 1.5px 0 rgba(255,255,255,0.21), inset 0 -1px 0 rgba(0,0,0,0.14)';
};

// Tinted glass factory
const tint = (r: number, g: number, b: number): CSSProperties => ({
  ...G,
  background: `linear-gradient(170deg, rgba(${r},${g},${b},0.22) 0%, rgba(${r},${g},${b},0.09) 100%)`,
  border: `1px solid rgba(${r},${g},${b},0.30)`,
  boxShadow: `0 4px 20px rgba(0,0,0,0.42), 0 0 20px rgba(${r},${g},${b},0.10), inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.12)`,
});

const tintHandlers = (r: number, g: number, b: number) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = `linear-gradient(170deg, rgba(${r},${g},${b},0.32) 0%, rgba(${r},${g},${b},0.16) 100%)`;
    e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.52), 0 0 28px rgba(${r},${g},${b},0.22), inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.14)`;
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = `linear-gradient(170deg, rgba(${r},${g},${b},0.22) 0%, rgba(${r},${g},${b},0.09) 100%)`;
    e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.42), 0 0 20px rgba(${r},${g},${b},0.10), inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.12)`;
  },
});

// Section wrapper
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '44px' }}>
      <div style={{
        fontFamily: F, fontSize: '11px', fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.22)', marginBottom: '12px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        {label}
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.022)',
        border: '1px solid rgba(255,255,255,0.055)',
        borderRadius: '14px',
        padding: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

// Mode config
const MODES = {
  build:     { color: '#22c55e', rgb: '34,197,94',   label: 'Build',     desc: 'Generate & deploy code' },
  plan:      { color: '#3b82f6', rgb: '59,130,246',  label: 'Plan',      desc: 'Create a project plan' },
  architect: { color: '#f97316', rgb: '249,115,22',  label: 'Architect', desc: 'Design architecture'   },
} as const;

type ModeKey = keyof typeof MODES;

export default function DesignTheme() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ModeKey>('build');
  const [showDropdown, setShowDropdown] = useState(false);

  const triggerLoad = (id: string) => {
    setLoadingId(id);
    setTimeout(() => setLoadingId(null), 2200);
  };

  const mode = MODES[activeMode];

  return (
    <div style={{ minHeight: '100vh', background: '#06060b', position: 'relative', overflowX: 'hidden' }}>

      {/* Ambient orbs — critical for glass to read */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-12%', left: '-8%',
          width: '55vw', height: '55vh',
          background: 'radial-gradient(ellipse, rgba(88,28,245,0.18) 0%, transparent 68%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: '60vw', height: '55vh',
          background: 'radial-gradient(ellipse, rgba(29,78,216,0.14) 0%, transparent 68%)',
        }} />
        <div style={{
          position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '80vw', height: '40vh',
          background: 'radial-gradient(ellipse, rgba(90,40,200,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <FloatingNav />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: '96px', paddingBottom: '120px' }}>
        <div className="max-w-4xl mx-auto px-6 md:px-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '64px' }}
          >
            <span style={{
              fontFamily: F, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
              display: 'block', marginBottom: '12px',
            }}>
              Internal · Design System
            </span>
            <h1 style={{
              fontFamily: F, fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 800,
              color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.03em',
              lineHeight: 1.1, margin: '0 0 12px',
            }}>
              Button Variants
            </h1>
            <p style={{
              fontFamily: F, fontSize: '15px', color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.65, margin: 0, maxWidth: '460px',
            }}>
              Apple Vision Pro glassmorphism — production-ready components for Buildable Labs.
              Drop sections below as the system grows.
            </p>
          </motion.div>

          {/* ── 1. Primary Glass Pills ──────────────────── */}
          <Section label="Primary Glass">
            {/* Matches current "Open Dashboard" — baseline */}
            <motion.button
              style={{ ...G, borderRadius: '999px', padding: '7px 16px', fontSize: '13px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
            >
              <LayoutDashboard size={13} strokeWidth={2} />
              Open Dashboard
            </motion.button>

            {/* With trailing arrow */}
            <motion.button
              style={{ ...G, borderRadius: '999px', padding: '9px 20px', fontSize: '14px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
            >
              Get Started
              <ArrowRight size={14} strokeWidth={2.2} />
            </motion.button>

            {/* Large rounded rect CTA */}
            <motion.button
              style={{ ...G, borderRadius: '14px', padding: '12px 28px', fontSize: '15px', fontWeight: 600 }}
              whileHover={{ y: -2, scale: 1.01 }} whileTap={{ y: 1.5, scale: 0.97 }}
              transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
            >
              <Rocket size={16} strokeWidth={2} />
              Launch Your Bot
            </motion.button>

            {/* Ghost / outline only */}
            <motion.button
              style={{
                ...G,
                borderRadius: '999px', padding: '7px 16px', fontSize: '13px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'none',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                color: 'rgba(255,255,255,0.50)',
              }}
              whileHover={{ y: -1, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.80)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.50)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Learn More
            </motion.button>
          </Section>

          {/* ── 2. Tinted Variants ──────────────────────── */}
          <Section label="Tinted Variants">
            {([
              { label: 'Brand',   r: 139, g: 92,  b: 246, icon: <Sparkles size={13} strokeWidth={2} /> },
              { label: 'Info',    r: 59,  g: 130, b: 246, icon: null },
              { label: 'Success', r: 34,  g: 197, b: 94,  icon: <Check size={13} strokeWidth={2.5} /> },
              { label: 'Danger',  r: 239, g: 68,  b: 68,  icon: null },
              { label: 'Warning', r: 245, g: 158, b: 11,  icon: null },
            ] as const).map(({ label, r, g, b, icon }) => (
              <motion.button
                key={label}
                style={{ ...tint(r, g, b), borderRadius: '999px', padding: '8px 18px', fontSize: '13px' }}
                whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
                transition={TR} {...tintHandlers(r, g, b)}
              >
                {icon}
                {label}
              </motion.button>
            ))}
          </Section>

          {/* ── 3. Mode Buttons (Workspace) ────────────── */}
          <Section label="Mode Buttons — Workspace">
            {/* Interactive mode selector */}
            <div style={{ position: 'relative' }}>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.14 }}
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
                    background: 'rgba(10,10,18,0.88)',
                    backdropFilter: 'blur(32px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '12px', padding: '6px',
                    width: '215px', zIndex: 100,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
                  }}
                >
                  {(Object.entries(MODES) as [ModeKey, typeof MODES[ModeKey]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => { setActiveMode(key); setShowDropdown(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px',
                        border: 'none', cursor: 'pointer',
                        background: activeMode === key ? 'rgba(255,255,255,0.07)' : 'transparent',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = activeMode === key ? 'rgba(255,255,255,0.07)' : 'transparent';
                      }}
                    >
                      <div style={{
                        width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                        background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`,
                      }} />
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <p style={{ fontFamily: F, fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{cfg.label}</p>
                        <p style={{ fontFamily: F, fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{cfg.desc}</p>
                      </div>
                      {activeMode === key && <Check size={13} strokeWidth={2.5} style={{ color: cfg.color, flexShrink: 0 }} />}
                    </button>
                  ))}
                </motion.div>
              )}

              <motion.button
                onClick={() => setShowDropdown(v => !v)}
                style={{
                  ...G,
                  borderRadius: '10px', padding: '7px 12px', fontSize: '12px',
                  border: `1px solid rgba(${mode.rgb},0.30)`,
                  background: `linear-gradient(170deg, rgba(${mode.rgb},0.18) 0%, rgba(${mode.rgb},0.08) 100%)`,
                  boxShadow: `0 3px 14px rgba(0,0,0,0.38), 0 0 16px rgba(${mode.rgb},0.08), inset 0 1.5px 0 rgba(255,255,255,0.12)`,
                }}
                whileHover={{ y: -1, scale: 1.02 }} whileTap={{ y: 1, scale: 0.97 }}
                transition={TR}
              >
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: mode.color, boxShadow: `0 0 6px ${mode.color}`,
                }} />
                <span style={{ color: 'rgba(255,255,255,0.82)' }}>{mode.label}</span>
                <ChevronDown size={12} strokeWidth={2.5} style={{
                  color: 'rgba(255,255,255,0.38)',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }} />
              </motion.button>
            </div>

            {/* Static previews — all three modes */}
            {(Object.entries(MODES) as [ModeKey, typeof MODES[ModeKey]][]).map(([key, cfg]) => (
              <motion.button
                key={key}
                style={{
                  ...G,
                  borderRadius: '10px', padding: '7px 12px', fontSize: '12px',
                  border: `1px solid rgba(${cfg.rgb},0.25)`,
                  background: `linear-gradient(170deg, rgba(${cfg.rgb},0.14) 0%, rgba(${cfg.rgb},0.06) 100%)`,
                  boxShadow: `0 3px 14px rgba(0,0,0,0.38), inset 0 1.5px 0 rgba(255,255,255,0.10)`,
                }}
                whileHover={{ y: -1, scale: 1.02 }} whileTap={{ y: 1, scale: 0.97 }}
                transition={TR}
              >
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: cfg.color, boxShadow: `0 0 5px ${cfg.color}`,
                }} />
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>{cfg.label}</span>
                <ChevronDown size={12} strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.32)' }} />
              </motion.button>
            ))}
          </Section>

          {/* ── 4. Sizes ────────────────────────────────── */}
          <Section label="Sizes">
            {([
              { size: 'XS', p: '5px 12px',  fs: '11px', br: '8px'  },
              { size: 'SM', p: '7px 14px',  fs: '12px', br: '10px' },
              { size: 'MD', p: '8px 18px',  fs: '13px', br: '12px' },
              { size: 'LG', p: '11px 24px', fs: '14px', br: '14px' },
              { size: 'XL', p: '14px 32px', fs: '16px', br: '16px' },
            ]).map(({ size, p, fs, br }) => (
              <motion.button
                key={size}
                style={{ ...G, borderRadius: br, padding: p, fontSize: fs, fontWeight: size === 'XL' ? 600 : 500 }}
                whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
                transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
              >
                {size}
              </motion.button>
            ))}
          </Section>

          {/* ── 5. States ────────────────────────────────── */}
          <Section label="States">
            {/* Default */}
            <motion.button
              style={{ ...G, borderRadius: '999px', padding: '8px 18px', fontSize: '13px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
            >
              Default
            </motion.button>

            {/* Loading */}
            <motion.button
              onClick={() => triggerLoad('state')}
              style={{
                ...G, borderRadius: '999px', padding: '8px 18px', fontSize: '13px',
                opacity: loadingId === 'state' ? 0.72 : 1,
                cursor: loadingId === 'state' ? 'default' : 'pointer',
              }}
              whileHover={loadingId !== 'state' ? { y: -1.5, scale: 1.01 } : {}}
              whileTap={loadingId !== 'state' ? { y: 1, scale: 0.97 } : {}}
              transition={TR}
              onMouseEnter={loadingId !== 'state' ? onGE : undefined}
              onMouseLeave={loadingId !== 'state' ? onGL : undefined}
            >
              {loadingId === 'state'
                ? <><Loader2 size={13} className="animate-spin" />Loading…</>
                : 'Click to Load'
              }
            </motion.button>

            {/* Active / pressed */}
            <button style={{
              ...G, borderRadius: '999px', padding: '8px 18px', fontSize: '13px',
              background: 'linear-gradient(170deg, rgba(255,255,255,0.080) 0%, rgba(255,255,255,0.038) 100%)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(0,0,0,0.08)',
              transform: 'translateY(1px)',
            }}>
              Pressed
            </button>

            {/* Disabled */}
            <button disabled style={{
              ...G, borderRadius: '999px', padding: '8px 18px', fontSize: '13px',
              opacity: 0.30, cursor: 'not-allowed',
            }}>
              Disabled
            </button>
          </Section>

          {/* ── 6. Icon + Text ───────────────────────────── */}
          <Section label="With Icons">
            <motion.button
              style={{ ...G, borderRadius: '12px', padding: '10px 20px', fontSize: '14px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
            >
              <Zap size={15} strokeWidth={2} />
              Build Now
            </motion.button>

            <motion.button
              style={{ ...tint(139, 92, 246), borderRadius: '12px', padding: '10px 20px', fontSize: '14px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} {...tintHandlers(139, 92, 246)}
            >
              <Bot size={15} strokeWidth={2} />
              Create Bot
            </motion.button>

            <motion.button
              style={{ ...tint(34, 197, 94), borderRadius: '12px', padding: '10px 20px', fontSize: '14px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} {...tintHandlers(34, 197, 94)}
            >
              <Rocket size={15} strokeWidth={2} />
              Deploy
            </motion.button>

            <motion.button
              style={{ ...G, borderRadius: '12px', padding: '10px 20px', fontSize: '14px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
            >
              View Code
              <Code2 size={15} strokeWidth={2} />
            </motion.button>

            <motion.button
              style={{ ...G, borderRadius: '12px', padding: '10px 20px', fontSize: '14px' }}
              whileHover={{ y: -1.5, scale: 1.01 }} whileTap={{ y: 1, scale: 0.97 }}
              transition={TR} onMouseEnter={onGE} onMouseLeave={onGL}
            >
              <Terminal size={15} strokeWidth={2} />
              Terminal
            </motion.button>
          </Section>

          {/* ── 7. Icon Only (Circles) ───────────────────── */}
          <Section label="Icon Only">
            {([
              { icon: <Plus size={16} strokeWidth={2.2} />,    r: 255, g: 255, b: 255, neutral: true  },
              { icon: <ArrowRight size={16} strokeWidth={2.2}/>,r: 255, g: 255, b: 255, neutral: true  },
              { icon: <Send size={16} strokeWidth={2} />,       r: 255, g: 255, b: 255, neutral: true  },
              { icon: <Zap size={16} strokeWidth={2} />,        r: 245, g: 158, b: 11,  neutral: false },
              { icon: <Bot size={16} strokeWidth={2} />,        r: 139, g: 92,  b: 246, neutral: false },
              { icon: <Code2 size={16} strokeWidth={2} />,      r: 59,  g: 130, b: 246, neutral: false },
              { icon: <Terminal size={16} strokeWidth={2} />,   r: 34,  g: 197, b: 94,  neutral: false },
              { icon: <Music size={16} strokeWidth={2} />,      r: 239, g: 68,  b: 68,  neutral: false },
            ] as const).map(({ icon, r, g, b, neutral }, i) => (
              <motion.button
                key={i}
                style={{
                  ...(neutral ? G : tint(r, g, b)),
                  width: '36px', height: '36px', borderRadius: '50%', padding: 0,
                  gap: 0,
                }}
                whileHover={{ y: -2, scale: 1.06 }} whileTap={{ y: 1, scale: 0.93 }}
                transition={TR}
                onMouseEnter={neutral ? onGE : tintHandlers(r, g, b).onMouseEnter}
                onMouseLeave={neutral ? onGL : tintHandlers(r, g, b).onMouseLeave}
              >
                {icon}
              </motion.button>
            ))}

            {/* Large send circle */}
            <motion.button
              style={{ ...tint(139, 92, 246), width: '48px', height: '48px', borderRadius: '50%', padding: 0, gap: 0 }}
              whileHover={{ y: -2, scale: 1.05 }} whileTap={{ y: 1, scale: 0.93 }}
              transition={TR} {...tintHandlers(139, 92, 246)}
            >
              <Rocket size={20} strokeWidth={2} />
            </motion.button>
          </Section>

          {/* ── 8. Send Button (Workspace) ───────────────── */}
          <Section label="Send Button — Workspace Chat">
            {/* Inactive (empty input) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <p style={{ fontFamily: F, fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Empty</p>
                <motion.button
                  style={{
                    ...G,
                    width: '32px', height: '32px', borderRadius: '50%', padding: 0, gap: 0,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none',
                    cursor: 'not-allowed',
                  }}
                >
                  <ArrowRight size={14} strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.30)' }} />
                </motion.button>
              </div>
              <div>
                <p style={{ fontFamily: F, fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Active</p>
                <motion.button
                  style={{
                    ...G,
                    width: '32px', height: '32px', borderRadius: '50%', padding: 0, gap: 0,
                    background: 'rgba(255,255,255,0.90)',
                    border: '1px solid rgba(255,255,255,0.20)',
                    boxShadow: '0 2px 12px rgba(255,255,255,0.18)',
                    backdropFilter: 'none', WebkitBackdropFilter: 'none',
                    color: '#06060b',
                  }}
                  whileHover={{ scale: 1.07, boxShadow: '0 4px 20px rgba(255,255,255,0.28)' } as any}
                  whileTap={{ scale: 0.93 }}
                  transition={TR}
                >
                  <ArrowRight size={14} strokeWidth={2.5} />
                </motion.button>
              </div>
              <div>
                <p style={{ fontFamily: F, fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Loading</p>
                <motion.button
                  onClick={() => triggerLoad('send')}
                  style={{
                    ...G,
                    width: '32px', height: '32px', borderRadius: '50%', padding: 0, gap: 0,
                    background: 'rgba(255,255,255,0.90)',
                    border: '1px solid rgba(255,255,255,0.20)',
                    boxShadow: '0 2px 12px rgba(255,255,255,0.18)',
                    backdropFilter: 'none', WebkitBackdropFilter: 'none',
                    color: '#06060b',
                  }}
                  whileTap={{ scale: 0.93 }}
                  transition={TR}
                >
                  {loadingId === 'send'
                    ? <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
                    : <ArrowRight size={14} strokeWidth={2.5} />
                  }
                </motion.button>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
