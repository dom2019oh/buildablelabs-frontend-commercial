import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';

// ── helpers ──────────────────────────────────────────────────────────────────
function useTypewriter(text: string, startMs: number, speed = 55) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    const t0 = setTimeout(() => {
      [...text].forEach((ch, i) => {
        timers.push(setTimeout(() => setDisplayed(text.slice(0, i + 1)), i * speed));
      });
    }, startMs);
    return () => { clearTimeout(t0); timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return displayed;
}

// ── Stack logo mark (SVG inline) ──────────────────────────────────────────────
function StackMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="32" height="7" rx="3.5" fill="white" />
      <rect x="4" y="16.5" width="32" height="7" rx="3.5" fill="white" />
      <rect x="4" y="29" width="32" height="7" rx="3.5" fill="white" />
    </svg>
  );
}

// ── Star field ────────────────────────────────────────────────────────────────
function StarField() {
  const stars = useRef(
    Array.from({ length: 180 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.1 + 0.3,
      dur: Math.random() * 3 + 2,
      delay: Math.random() * 4,
    }))
  );
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
      {stars.current.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white">
          <animate attributeName="opacity" values="0.15;0.7;0.15" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ── SCENE 1 — Hero ────────────────────────────────────────────────────────────
function HeroScene() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#040310' }}>
      <StarField />
      {/* top bloom */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 260, background: 'radial-gradient(ellipse at center top, rgba(90,30,200,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* nav */}
      <div className="relative flex items-center justify-between px-10 pt-6">
        <div className="flex items-center gap-2.5">
          <StackMark size={22} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: '-0.02em' }}>buildable</span>
        </div>
        <div className="flex items-center gap-3">
          {['Solutions','Resources','Pricing'].map(l => (
            <span key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{l}</span>
          ))}
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '5px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            Get Started
          </div>
        </div>
      </div>
      {/* hero body */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-5 pb-10">
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '4px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          AI Discord Bot Builder
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 52, lineHeight: 1.08, textAlign: 'center', color: 'white', letterSpacing: '-0.03em', maxWidth: 620 }}>
          Build your bot.<br />
          <span style={{ fontStyle: 'italic', fontFamily: "'Instrument Serif', serif", color: 'rgba(180,160,255,0.9)' }}>Ship it today.</span>
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 420, textAlign: 'center', lineHeight: 1.6 }}>
          Describe your Discord bot in plain English — Buildable AI generates, deploys and hosts it instantly.
        </p>
        {/* prompt input */}
        <div style={{ width: 520, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '14px 18px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
          Describe your bot…
        </div>
        {/* CTA */}
        <div className="flex gap-3 mt-1">
          <div style={{ background: 'rgba(109,40,217,0.58)', border: '1px solid rgba(139,92,246,0.4)', backdropFilter: 'blur(28px)', borderRadius: 10, padding: '10px 26px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: 'white' }}>
            Start Building Free
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 22px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            See examples →
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCENE 2 — Login ───────────────────────────────────────────────────────────
function LoginScene({ emailText, passwordText }: { emailText: string; passwordText: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#040310' }}>
      <StarField />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 220, background: 'radial-gradient(ellipse at center top, rgba(90,30,200,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: 380, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px 32px' }}>
        <div className="flex flex-col items-center mb-7">
          <StackMark size={28} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: 'white', marginTop: 10, letterSpacing: '-0.02em' }}>Welcome back</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Sign in to Buildable Labs</span>
        </div>
        {/* email */}
        <div className="mb-3">
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 5 }}>Email</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '10px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)', minHeight: 40 }}>
            {emailText}<span style={{ opacity: emailText.length > 0 ? 1 : 0, animation: 'blink 1s step-end infinite' }}>|</span>
          </div>
        </div>
        {/* password */}
        <div className="mb-5">
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 5 }}>Password</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '10px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)', minHeight: 40 }}>
            {'•'.repeat(passwordText.length)}<span style={{ opacity: passwordText.length > 0 ? 1 : 0, animation: 'blink 1s step-end infinite' }}>|</span>
          </div>
        </div>
        <div style={{ background: 'rgba(109,40,217,0.65)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 10, padding: '11px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: 'white', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
          Sign In
        </div>
      </div>
    </div>
  );
}

// ── SCENE 3 — Dashboard ───────────────────────────────────────────────────────
function DashboardScene({ showDialog, botNameText }: { showDialog: boolean; botNameText: string }) {
  const bots = [
    { name: 'MusicBot', lang: 'Python', status: 'live', emoji: '🎵' },
    { name: 'ModBot', lang: 'Python', status: 'live', emoji: '🛡️' },
    { name: 'WelcomeBot', lang: 'Python', status: 'draft', emoji: '👋' },
  ];
  return (
    <div className="absolute inset-0 flex" style={{ background: '#080a0c' }}>
      {/* sidebar */}
      <div style={{ width: 176, background: '#0c0c0c', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '18px 0' }}>
        <div className="flex items-center gap-2 px-4 mb-6">
          <StackMark size={18} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, color: 'white', letterSpacing: '-0.02em' }}>buildable</span>
        </div>
        {['Home','My Bots','Templates','Settings'].map((item, i) => (
          <div key={item} style={{ padding: '7px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: i === 1 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', background: i === 1 ? 'rgba(255,255,255,0.06)' : 'transparent', borderRadius: i === 1 ? 6 : 0, margin: i === 1 ? '0 6px' : 0 }}>
            {item}
          </div>
        ))}
      </div>
      {/* main */}
      <div className="flex-1 flex flex-col p-8">
        <div className="mb-7">
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: 'white', letterSpacing: '-0.02em' }}>Ready to build, James?</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Your bots, your way.</p>
        </div>
        {/* bot grid */}
        <div className="grid grid-cols-3 gap-4 mb-6" style={{ maxWidth: 680 }}>
          {/* new bot card */}
          <motion.div
            animate={{ scale: showDialog ? 1.04 : 1, boxShadow: showDialog ? '0 0 0 2px rgba(124,58,237,0.5)' : '0 0 0 0px transparent' }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 110, cursor: 'pointer' }}
          >
            <div style={{ fontSize: 24, opacity: 0.5 }}>+</div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>New Bot</span>
          </motion.div>
          {bots.map(b => (
            <div key={b.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px', minHeight: 110 }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{b.emoji}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{b.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: b.status === 'live' ? '#4ade80' : 'rgba(255,255,255,0.3)', marginTop: 4 }}>{b.status}</div>
            </div>
          ))}
        </div>
        {/* new bot dialog */}
        <AnimatePresence>
          {showDialog && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 360, background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '28px 26px', zIndex: 20 }}
            >
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 16 }}>Name your bot</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, padding: '10px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16, minHeight: 40 }}>
                {botNameText}<span style={{ animation: 'blink 1s step-end infinite', opacity: 0.7 }}>|</span>
              </div>
              <div style={{ background: 'rgba(109,40,217,0.6)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 9, padding: '10px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: 'white', textAlign: 'center' }}>
                Create Bot
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── SCENE 4 — Workspace ───────────────────────────────────────────────────────
function WorkspaceScene({ promptText, promptSent }: { promptText: string; promptSent: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0e0d12' }}>
      {/* top bar */}
      <div style={{ height: 46, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12 }}>
        <StackMark size={16} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>MusicBot</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['Code','Preview','Settings'].map((t,i) => (
            <div key={t} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '4px 12px', borderRadius: 7, background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent', color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>{t}</div>
          ))}
        </div>
      </div>
      {/* body */}
      <div className="flex flex-1 overflow-hidden">
        {/* file tree */}
        <div style={{ width: 160, background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '12px 8px' }}>
          {['main.py','commands.py','config.py','.env'].map((f,i) => (
            <div key={f} style={{ padding: '5px 10px', fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: i === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)', background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent', borderRadius: 5, marginBottom: 2 }}>{f}</div>
          ))}
        </div>
        {/* code pane */}
        <div style={{ flex: 1, padding: '16px 20px', fontFamily: "'Geist Mono', 'Fira Code', monospace", fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, overflow: 'hidden' }}>
          <div style={{ color: '#a78bfa' }}>import discord</div>
          <div style={{ color: '#a78bfa' }}>from discord.ext import commands</div>
          <div style={{ height: 8 }} />
          <div><span style={{ color: '#4ade80' }}>bot</span> = commands.Bot(command_prefix=<span style={{ color: '#fbbf24' }}>'!'</span>)</div>
          <div style={{ height: 8 }} />
          <div><span style={{ color: '#60a5fa' }}>@bot</span>.command()</div>
          <div><span style={{ color: '#4ade80' }}>async def</span> <span style={{ color: '#f97316' }}>play</span>(ctx, *, query):</div>
          <div style={{ paddingLeft: 20 }}>await ctx.send(<span style={{ color: '#fbbf24' }}>"🎵 Now playing: "</span> + query)</div>
          <div style={{ height: 8 }} />
          <div><span style={{ color: '#60a5fa' }}>@bot</span>.command()</div>
          <div><span style={{ color: '#4ade80' }}>async def</span> <span style={{ color: '#f97316' }}>skip</span>(ctx):</div>
          <div style={{ paddingLeft: 20 }}>await ctx.send(<span style={{ color: '#fbbf24' }}>"⏭ Skipped!"</span>)</div>
        </div>
        {/* chat panel */}
        <div style={{ width: 280, background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '14px 12px', overflow: 'hidden' }}>
            <AnimatePresence>
              {promptSent && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {/* user bubble */}
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: 'rgba(109,40,217,0.45)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.85)', maxWidth: 200 }}>
                      {promptText}
                    </div>
                  </div>
                  {/* ai response */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 12px 12px 12px', padding: '8px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.65)', maxWidth: 220 }}>
                      Adding a skip queue feature… generating code.
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* input */}
          <div style={{ padding: '10px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '8px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.7)', minHeight: 36 }}>
              {!promptSent ? promptText : ''}{!promptSent && <span style={{ animation: 'blink 1s step-end infinite', opacity: 0.6 }}>|</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCENE 5 — Building ────────────────────────────────────────────────────────
const BUILD_STAGES = [
  { label: 'Parsing prompt', icon: '◎' },
  { label: 'Planning architecture', icon: '⬡' },
  { label: 'Generating code', icon: '⬡' },
  { label: 'Running tests', icon: '⬡' },
  { label: 'Deploying to Railway', icon: '⬡' },
];

function BuildingScene({ stagesDone }: { stagesDone: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0e0d12' }}>
      <div style={{ width: 480 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 6, letterSpacing: '-0.02em' }}>Building MusicBot</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Sit tight — AI is generating your bot.</div>
        <div className="space-y-3">
          {BUILD_STAGES.map((s, i) => {
            const done = i < stagesDone;
            const active = i === stagesDone;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i <= stagesDone ? 1 : 0.2, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 8, background: done ? 'rgba(74,222,128,0.15)' : active ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.04)', border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                  {done ? '✓' : active ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> : '·'}
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: done ? 'rgba(255,255,255,0.8)' : active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }}>{s.label}</span>
                {done && <span style={{ marginLeft: 'auto', fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#4ade80' }}>done</span>}
                {active && <span style={{ marginLeft: 'auto', fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(139,92,246,0.9)' }}>running…</span>}
              </motion.div>
            );
          })}
        </div>
        {/* progress bar */}
        <div style={{ marginTop: 24, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <motion.div
            animate={{ width: `${Math.min(100, (stagesDone / BUILD_STAGES.length) * 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', borderRadius: 2 }}
          />
        </div>
        {stagesDone >= BUILD_STAGES.length && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ marginTop: 22, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 12, padding: '14px 18px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>✓</span> MusicBot is live · discord.gg/musicbot
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── SCENE 6 — Fin ─────────────────────────────────────────────────────────────
function FinScene({ phase }: { phase: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#040310' }}>
      <StarField />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse at center top, rgba(90,30,200,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.8 }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }} className="relative flex flex-col items-center gap-4">
        <StackMark size={52} />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 8 }} transition={{ duration: 0.6 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 42, color: 'white', letterSpacing: '-0.04em' }}>buildable</span>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 18, color: 'rgba(180,160,255,0.75)', textAlign: 'center' }}>Build bots that do more.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
          <div style={{ background: 'rgba(109,40,217,0.55)', border: '1px solid rgba(139,92,246,0.35)', backdropFilter: 'blur(24px)', borderRadius: 10, padding: '11px 30px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: 'white', marginTop: 8 }}>
            buildablelabs.dev
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Main AdPreview ─────────────────────────────────────────────────────────────
export default function AdPreview() {
  type Scene = 'hero' | 'login' | 'dashboard' | 'workspace' | 'building' | 'fin';
  const [scene, setScene] = useState<Scene>('hero');
  const [cursor, setCursor] = useState({ x: 640, y: 360 });
  const [clicking, setClicking] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // typing states
  const [emailText, setEmailText] = useState('');
  const [passwordText, setPasswordText] = useState('');
  const [botNameText, setBotNameText] = useState('');
  const [showBotDialog, setShowBotDialog] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [promptSent, setPromptSent] = useState(false);
  const [stagesDone, setStagesDone] = useState(0);
  const [finPhase, setFinPhase] = useState(0);

  // camera
  const camScale = useMotionValue(1);
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);
  let rippleId = useRef(0);

  function click(x: number, y: number) {
    // move cursor
    setCursor({ x, y });
    // click animation
    setClicking(true);
    setTimeout(() => setClicking(false), 180);
    // ripple
    const id = ++rippleId.current;
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
    // camera punch zoom
    const cx = 640, cy = 360;
    const dx = (x - cx) * 0.04;
    const dy = (y - cy) * 0.04;
    animate(camScale, 1.06, { duration: 0.18, ease: [0.2, 0, 0.4, 1] });
    animate(camX, dx, { duration: 0.18, ease: [0.2, 0, 0.4, 1] });
    animate(camY, dy, { duration: 0.18, ease: [0.2, 0, 0.4, 1] });
    setTimeout(() => {
      animate(camScale, 1, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
      animate(camX, 0, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
      animate(camY, 0, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
    }, 180);
  }

  function type(setter: (v: string) => void, text: string, startMs: number, speed = 60) {
    return setTimeout(() => {
      [...text].forEach((_, i) => {
        setTimeout(() => setter(text.slice(0, i + 1)), i * speed);
      });
    }, startMs);
  }

  // timeline
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    function at(ms: number, fn: () => void) { timers.push(setTimeout(fn, ms)); }

    // ── scene 1: hero (0–3600ms) ──
    at(1400, () => setCursor({ x: 490, y: 395 }));
    at(2200, () => setCursor({ x: 490, y: 434 })); // hover CTA
    at(3000, () => { click(490, 434); });
    at(3400, () => setScene('login'));

    // ── scene 2: login (3400–10200ms) ──
    at(3800, () => setCursor({ x: 640, y: 310 }));
    at(4200, () => { click(640, 310); }); // click email field
    type(setEmailText, 'james@buildablelabs.dev', 4600, 55);
    at(6000, () => { click(640, 370); }); // click password
    type(setPasswordText, 'mypassword', 6200, 80);
    at(8000, () => setCursor({ x: 640, y: 430 }));
    at(8600, () => { click(640, 430); }); // click Sign In
    at(9400, () => setScene('dashboard'));

    // ── scene 3: dashboard (9400–15800ms) ──
    at(9900, () => setCursor({ x: 260, y: 280 }));
    at(10600, () => { click(260, 280); setShowBotDialog(true); });
    type(setBotNameText, 'MusicBot', 11000, 70);
    at(12600, () => setCursor({ x: 640, y: 420 }));
    at(13200, () => { click(640, 420); }); // click Create
    at(14000, () => { setShowBotDialog(false); setScene('workspace'); });

    // ── scene 4: workspace (14000–22000ms) ──
    at(14600, () => setCursor({ x: 900, y: 600 }));
    at(15000, () => { click(900, 600); }); // click chat input
    type(setPromptText, 'Add a skip queue command', 15400, 55);
    at(18800, () => setCursor({ x: 978, y: 630 }));
    at(19400, () => { click(978, 630); setPromptSent(true); });
    at(21000, () => setScene('building'));

    // ── scene 5: building (21000–30000ms) ──
    [0,1,2,3,4].forEach((i) => {
      at(21800 + i * 1650, () => setStagesDone(i + 1));
      at(22200 + i * 1650, () => {
        const sx = 320 + Math.random() * 80;
        const sy = 300 + i * 40;
        click(sx, sy);
      });
    });
    at(30800, () => setScene('fin'));

    // ── scene 6: fin (30800–37000ms) ──
    at(31400, () => setFinPhase(1));
    at(32200, () => setFinPhase(2));
    at(33200, () => setFinPhase(3));
    at(36500, () => setCursor({ x: 640, y: 500 }));

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* letterbox */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 36, background: '#000', zIndex: 100 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 36, background: '#000', zIndex: 100 }} />

      {/* viewport container */}
      <div style={{ position: 'relative', width: 1280, height: 720, overflow: 'hidden' }}>
        {/* camera layer */}
        <motion.div
          style={{ position: 'absolute', inset: 0, scale: camScale, x: camX, y: camY, transformOrigin: 'center center' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ position: 'absolute', inset: 0 }}
            >
              {scene === 'hero' && <HeroScene />}
              {scene === 'login' && <LoginScene emailText={emailText} passwordText={passwordText} />}
              {scene === 'dashboard' && <DashboardScene showDialog={showBotDialog} botNameText={botNameText} />}
              {scene === 'workspace' && <WorkspaceScene promptText={promptText} promptSent={promptSent} />}
              {scene === 'building' && <BuildingScene stagesDone={stagesDone} />}
              {scene === 'fin' && <FinScene phase={finPhase} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* cursor (outside camera so it stays at screen coords) */}
        <motion.div
          animate={{ x: cursor.x - 10, y: cursor.y - 10, scale: clicking ? 0.72 : 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          style={{ position: 'absolute', width: 20, height: 20, borderRadius: 6, border: '2px solid white', boxShadow: '0 0 8px rgba(255,255,255,0.5)', pointerEvents: 'none', zIndex: 60, transformOrigin: 'center center' }}
        />

        {/* click ripples */}
        {ripples.map(rp => (
          <motion.div
            key={rp.id}
            initial={{ scale: 0, opacity: 0.65, x: rp.x - 12, y: rp.y - 12 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{ position: 'absolute', width: 24, height: 24, borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.5)', pointerEvents: 'none', zIndex: 59 }}
          />
        ))}
      </div>
    </div>
  );
}
