import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// ─── Mini orb spinner (canvas, matches hero orb style) ────────────────────────
function MiniOrb({ size = 48 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 120, H = 120;
    const CX = W / 2, CY = H / 2;
    const R = 44;
    const FOV = 200;
    const N = 90;
    const golden = Math.PI * (3 - Math.sqrt(5));

    const particles = Array.from({ length: N }, (_, i) => {
      const cosP = 1 - (2 * i) / (N - 1);
      const phi = Math.acos(Math.max(-1, Math.min(1, cosP)));
      const theta = (golden * i) % (2 * Math.PI);
      return { phi, theta };
    });

    let rotY = 0;
    let frame = 0;
    const tiltX = 0.4;
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);
    let raf = 0;

    // Single sweeping pulse
    let pulseR = 0;
    const pulseSpeed = 0.025;
    const pulseMax = Math.PI;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;
      rotY += 0.022;
      pulseR = (pulseR + pulseSpeed) % pulseMax;

      const pts = particles.map(p => {
        const sinP = Math.sin(p.phi);
        const x = R * sinP * Math.cos(p.theta + rotY);
        const y = R * Math.cos(p.phi);
        const z = R * sinP * Math.sin(p.theta + rotY);
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        const scale = FOV / (FOV + z2 + R * 0.08);
        const sx = CX + x * scale;
        const sy = CY + y2 * scale;
        const depth = (z2 + R) / (2 * R);
        const baseAlpha = 0.18 + depth * 0.65;
        const baseSize = 0.5 + depth * 1.2;

        // Pulse boost
        const cosD = Math.cos(Math.PI / 2) * Math.cos(p.phi) +
          Math.sin(Math.PI / 2) * Math.sin(p.phi) * Math.cos(0 - p.theta);
        const d = Math.acos(Math.max(-1, Math.min(1, cosD)));
        const wave = Math.abs(d - pulseR);
        const fade = 1 - pulseR / pulseMax;
        const boost = wave < 0.25 ? 0.8 * (1 - wave / 0.25) * fade : 0;

        return { sx, sy, depth, baseAlpha, baseSize, boost };
      });

      pts.sort((a, b) => a.depth - b.depth);

      for (const { sx, sy, baseAlpha, baseSize, boost } of pts) {
        const alpha = Math.min(1, baseAlpha + boost * 0.85);
        const size = baseSize + boost * 2.5;
        const v = Math.round(170 + boost * 65);
        const b = Math.round(185 + boost * 55);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${v},${v},${b},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={120}
      style={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}

// ─── Simulation data ──────────────────────────────────────────────────────────

const PROMPT = 'Build me a music bot with a queue, skip, shuffle and now playing command';

const AI_STEPS = [
  'Analysing your request...',
  'Planning bot architecture...',
  'Mapping Discord API endpoints...',
  "Perfect. Here's what I'm building:\n  ✦ Queue management system\n  ✦ Skip & shuffle commands\n  ✦ Rich Now Playing embeds\n  ✦ Voice channel integration",
];

const CODE = `import discord
from discord.ext import commands
import yt_dlp, asyncio, random

bot = commands.Bot(command_prefix='!')
queue: list[str] = []

@bot.command()
async def play(ctx, *, query: str):
    queue.append(query)
    if not ctx.voice_client.is_playing():
        await _play_next(ctx)
    await ctx.send(f'✅  Added to queue: **{query}**')

@bot.command()
async def skip(ctx):
    ctx.voice_client.stop()
    await ctx.send('⏭  Skipped.')

@bot.command()
async def shuffle(ctx):
    random.shuffle(queue)
    await ctx.send('🔀  Queue shuffled.')

@bot.command()
async def nowplaying(ctx):
    src = ctx.voice_client.source
    embed = discord.Embed(
        title='🎵 Now Playing',
        description=src.title,
        color=0x5865F2
    )
    await ctx.send(embed=embed)

bot.run(TOKEN)`;

const DEPLOY_STEPS = [
  { icon: '📦', label: 'Packaging bot files',      ms: 700  },
  { icon: '📥', label: 'Installing dependencies',  ms: 1000 },
  { icon: '🔗', label: 'Configuring webhooks',     ms: 800  },
  { icon: '🚀', label: 'Starting bot process',     ms: 900  },
  { icon: '✅', label: 'Bot is live!',             ms: 400  },
];

const DISCORD_MSGS = [
  { id: 0, bot: false, user: 'james',    hue: '#5865F2', text: '!play daft punk - get lucky' },
  { id: 1, bot: true,  user: 'MusicBot', hue: '#57F287',
    embed: { title: '🎵 Now Playing', body: 'Daft Punk – Get Lucky', meta: '4:09  ·  Queued by james' } },
  { id: 2, bot: false, user: 'sarah_m',  hue: '#FEE75C', text: '!queue' },
  { id: 3, bot: true,  user: 'MusicBot', hue: '#57F287',
    embed: { title: '📋 Queue  (1 track)', body: '1.  Daft Punk – Get Lucky', meta: '' } },
  { id: 4, bot: false, user: 'james',    hue: '#5865F2', text: '!shuffle' },
  { id: 5, bot: true,  user: 'MusicBot', hue: '#57F287', text: '🔀  Queue shuffled.' },
  { id: 6, bot: false, user: 'dan_c',    hue: '#ED4245', text: '!nowplaying' },
  { id: 7, bot: true,  user: 'MusicBot', hue: '#57F287',
    embed: { title: '🎵 Now Playing', body: 'Daft Punk – Get Lucky', meta: '2:14 remaining' } },
];

type Phase = 'prompt' | 'thinking' | 'building' | 'deploying' | 'live';
const PHASES: Phase[] = ['prompt', 'thinking', 'building', 'deploying', 'live'];
const PHASE_LABELS = ['Prompt', 'Thinking', 'Building', 'Deploying', 'Live'];

// ─── Helper: tiny avatar ──────────────────────────────────────────────────────
function Avatar({ letter, color, bot }: { letter: string; color: string; bot?: boolean }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: bot ? '#5865F2' : color + '33', color: bot ? '#fff' : color, border: `1.5px solid ${color}55` }}
    >
      {letter}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BuildableSimulation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const [phase,       setPhase]       = useState<Phase>('prompt');
  const [started,     setStarted]     = useState(false);
  const [promptChars, setPromptChars] = useState(0);
  const [aiStep,      setAiStep]      = useState(-1);
  const [codeChars,   setCodeChars]   = useState(0);
  const [deployIdx,   setDeployIdx]   = useState(-1);
  const [discordIdx,  setDiscordIdx]  = useState(-1);

  // Start when in view
  useEffect(() => {
    if (inView && !started) setStarted(true);
  }, [inView, started]);

  // ── Phase: prompt ──
  useEffect(() => {
    if (!started || phase !== 'prompt') return;
    if (promptChars < PROMPT.length) {
      const t = setTimeout(() => setPromptChars(c => c + 1), 32);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('thinking'), 600);
    return () => clearTimeout(t);
  }, [started, phase, promptChars]);

  // ── Phase: thinking ──
  useEffect(() => {
    if (!started || phase !== 'thinking') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const delays = [200, 1000, 2000, 3200];
    delays.forEach((d, i) => timers.push(setTimeout(() => setAiStep(i), d)));
    timers.push(setTimeout(() => setPhase('building'), 5200));
    return () => timers.forEach(clearTimeout);
  }, [started, phase]);

  // ── Phase: building ──
  useEffect(() => {
    if (!started || phase !== 'building') return;
    if (codeChars < CODE.length) {
      const t = setTimeout(() => setCodeChars(c => Math.min(c + 4, CODE.length)), 14);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('deploying'), 800);
    return () => clearTimeout(t);
  }, [started, phase, codeChars]);

  // ── Phase: deploying ──
  useEffect(() => {
    if (!started || phase !== 'deploying') return;
    let elapsed = 300;
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEPLOY_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => setDeployIdx(i), elapsed));
      elapsed += step.ms;
    });
    timers.push(setTimeout(() => setPhase('live'), elapsed + 400));
    return () => timers.forEach(clearTimeout);
  }, [started, phase]);

  // ── Phase: live (Discord) ──
  useEffect(() => {
    if (!started || phase !== 'live') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const delays = [400, 1200, 3000, 3800, 5600, 6300, 8200, 9000];
    delays.forEach((d, i) => timers.push(setTimeout(() => setDiscordIdx(i), d)));
    return () => timers.forEach(clearTimeout);
  }, [started, phase]);

  const phaseIdx = PHASES.indexOf(phase);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(80,80,120,0.07) 0%, transparent 70%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Headline */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block text-[11px] tracking-[0.22em] uppercase mb-5 px-3.5 py-1.5 rounded-full"
            style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.28)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            Live simulation
          </span>
          <h2 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5"
            style={{ fontFamily: "'Geist', sans-serif", color: 'rgba(255,255,255,0.92)' }}>
            From idea to live bot
          </h2>
          <p className="max-w-md mx-auto text-base leading-relaxed"
            style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(226,232,240,0.45)', fontSize: '1rem' }}>
            Watch Buildable AI take a plain-English description and turn it into a
            deployed, working Discord bot — in real time.
          </p>
        </motion.div>

        {/* ── Simulation window ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0c0c10', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 100px rgba(0,0,0,0.7)' }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111116' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
            <span className="ml-3 text-xs" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>
              buildablelabs.dev — workspace
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#28c840' }}
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
              <span className="text-[11px]" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>live</span>
            </div>
          </div>

          {/* Phase tabs */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0e0e13' }}>
            {PHASE_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2.5 text-xs relative"
                style={{ fontFamily: "'Geist', 'DM Sans', sans-serif",
                  color: i === phaseIdx ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.3s' }}>
                {i < phaseIdx && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#28c840' }} />}
                {i === phaseIdx && (
                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5865F2' }}
                    animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                )}
                {i > phaseIdx && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />}
                {label}
                {i === phaseIdx && (
                  <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: '#5865F2' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Phase content ── */}
          <div style={{ minHeight: '360px' }}>
            <AnimatePresence mode="wait">

              {/* ── PROMPT ── */}
              {phase === 'prompt' && (
                <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }} className="p-8 flex flex-col gap-6">
                  <div className="text-xs tracking-widest uppercase"
                    style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>
                    james@buildable:~$
                  </div>
                  <div className="rounded-xl p-5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="text-xs mb-2" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.25)' }}>
                      What do you want to build?
                    </div>
                    <div className="text-base" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.82)' }}>
                      {PROMPT.slice(0, promptChars)}
                      <span className="inline-block w-[2px] h-4 ml-px align-middle"
                        style={{ background: 'rgba(255,255,255,0.6)', animation: 'blink 0.9s step-end infinite' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── THINKING ── */}
              {phase === 'thinking' && (
                <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }} className="p-8 flex flex-col gap-4">
                  {/* User message */}
                  <div className="flex items-start gap-3">
                    <Avatar letter="J" color="#5865F2" />
                    <div className="rounded-xl px-4 py-3 text-sm"
                      style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.2)',
                        fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.75)' }}>
                      {PROMPT}
                    </div>
                  </div>
                  {/* AI orb + responses */}
                  <div className="flex items-start gap-3">
                    {/* Mini orb instead of flat avatar during thinking */}
                    <div className="flex-shrink-0" style={{ marginTop: '-4px' }}>
                      <MiniOrb size={36} />
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      {AI_STEPS.map((msg, i) => aiStep >= i && (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="rounded-xl px-4 py-3 text-sm"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.72)',
                            whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                          {msg}
                          {i === aiStep && i < AI_STEPS.length - 1 && (
                            <span className="ml-1 inline-flex gap-0.5">
                              {[0,1,2].map(j => (
                                <motion.span key={j} className="inline-block w-1 h-1 rounded-full"
                                  style={{ background: 'rgba(255,255,255,0.4)' }}
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{ duration: 1, delay: j * 0.2, repeat: Infinity }} />
                              ))}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── BUILDING ── */}
              {phase === 'building' && (
                <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }} className="grid md:grid-cols-2 divide-x divide-white/[0.05]"
                  style={{ minHeight: '360px' }}>
                  {/* Left: AI chat */}
                  <div className="p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MiniOrb size={28} />
                      <div className="text-[11px] tracking-widest uppercase"
                        style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)' }}>
                        Buildable AI
                      </div>
                    </div>
                    {['Writing play command...', 'Adding queue system...', 'Building skip & shuffle...', 'Generating now playing embed...', 'Finalising bot.py...'].map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 1.1 }}
                        className="flex items-center gap-2.5 text-xs"
                        style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.45)' }}>
                        <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: '#28c840' }}
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ delay: i * 1.1 + 0.3 }} />
                        {msg}
                      </motion.div>
                    ))}
                  </div>
                  {/* Right: code */}
                  <div className="p-6 overflow-hidden">
                    <div className="text-[11px] tracking-widest uppercase mb-3"
                      style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)' }}>
                      bot.py
                    </div>
                    <pre className="text-xs leading-[1.8] overflow-hidden whitespace-pre-wrap break-words"
                      style={{ fontFamily: 'monospace', color: 'rgba(150,215,150,0.85)' }}>
                      {CODE.slice(0, codeChars)}
                      {codeChars < CODE.length && (
                        <span className="inline-block w-[2px] h-[11px] ml-px align-middle"
                          style={{ background: 'rgba(150,215,150,0.7)', animation: 'blink 0.9s step-end infinite' }} />
                      )}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* ── DEPLOYING ── */}
              {phase === 'deploying' && (
                <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }} className="p-10 flex flex-col items-center justify-center gap-6"
                  style={{ minHeight: '360px' }}>
                  {/* Mini orb as deploy spinner */}
                  <MiniOrb size={64} />
                  <div className="text-sm"
                    style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                    DEPLOYING TO CLOUD
                  </div>
                  <div className="w-full max-w-sm flex flex-col gap-3">
                    {DEPLOY_STEPS.map((step, i) => (
                      <motion.div key={i} className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -16 }} animate={deployIdx >= i ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4 }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                          style={{ background: deployIdx > i ? 'rgba(40,200,64,0.15)' : deployIdx === i ? 'rgba(88,101,242,0.2)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${deployIdx > i ? 'rgba(40,200,64,0.3)' : deployIdx === i ? 'rgba(88,101,242,0.35)' : 'rgba(255,255,255,0.06)'}` }}>
                          {deployIdx > i ? '✓' : step.icon}
                        </div>
                        <span className="text-sm"
                          style={{ fontFamily: "'Geist', 'DM Sans', sans-serif",
                            color: deployIdx > i ? 'rgba(40,200,64,0.7)' : deployIdx === i ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)' }}>
                          {step.label}
                        </span>
                        {deployIdx === i && i < DEPLOY_STEPS.length - 1 && (
                          <motion.div className="ml-auto flex gap-1">
                            {[0,1,2].map(j => (
                              <motion.div key={j} className="w-1 h-1 rounded-full"
                                style={{ background: 'rgba(88,101,242,0.6)' }}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 0.9, delay: j * 0.18, repeat: Infinity }} />
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── LIVE (Discord) ── */}
              {phase === 'live' && (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }} className="flex" style={{ minHeight: '360px' }}>
                  {/* Discord sidebar */}
                  <div className="hidden md:flex flex-col gap-2 px-3 py-4 flex-shrink-0"
                    style={{ width: '200px', background: '#1e1f22', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-[10px] tracking-widest uppercase px-2 mb-1"
                      style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.22)' }}>
                      Text Channels
                    </div>
                    {['general', 'music-bot-test', 'off-topic'].map(ch => (
                      <div key={ch} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer"
                        style={{ fontFamily: "'Geist', 'DM Sans', sans-serif",
                          color: ch === 'music-bot-test' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.32)',
                          background: ch === 'music-bot-test' ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                        # {ch}
                      </div>
                    ))}
                  </div>
                  {/* Chat area */}
                  <div className="flex-1 flex flex-col" style={{ background: '#313338' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.2)', background: '#2b2d31' }}>
                      <span className="text-sm" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.55)' }}>
                        # music-bot-test
                      </span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#57F287' }} />
                        <span className="text-xs" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                          MusicBot online
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 px-4 py-4 flex flex-col gap-4 overflow-hidden">
                      {DISCORD_MSGS.map((msg, i) => discordIdx >= i && (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }} className="flex items-start gap-3">
                          <Avatar letter={msg.user[0].toUpperCase()} color={msg.hue} bot={msg.bot} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold"
                                style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: msg.bot ? '#57F287' : msg.hue }}>
                                {msg.user}
                              </span>
                              {msg.bot && (
                                <span className="text-[9px] px-1 py-px rounded"
                                  style={{ background: '#5865F2', color: '#fff', fontFamily: "'Geist', 'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
                                  BOT
                                </span>
                              )}
                            </div>
                            {'text' in msg && msg.text && (
                              <div className="text-sm" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.78)' }}>
                                {msg.text}
                              </div>
                            )}
                            {'embed' in msg && msg.embed && (
                              <div className="rounded-lg p-3 mt-1"
                                style={{ background: '#2b2d31', borderLeft: `3px solid ${msg.hue}`, maxWidth: '320px' }}>
                                <div className="text-xs font-semibold mb-1"
                                  style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.85)' }}>
                                  {msg.embed.title}
                                </div>
                                <div className="text-xs" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-line' }}>
                                  {msg.embed.body}
                                </div>
                                {msg.embed.meta && (
                                  <div className="text-[11px] mt-1.5" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                                    {msg.embed.meta}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {/* Typing indicator */}
                      {discordIdx >= 0 && discordIdx < DISCORD_MSGS.length - 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <div className="w-8 h-8" />
                          <div className="flex items-center gap-1 text-xs"
                            style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                            <div className="flex gap-0.5">
                              {[0,1,2].map(j => (
                                <motion.div key={j} className="w-1 h-1 rounded-full"
                                  style={{ background: 'rgba(255,255,255,0.3)' }}
                                  animate={{ y: [0, -3, 0] }}
                                  transition={{ duration: 0.7, delay: j * 0.15, repeat: Infinity }} />
                              ))}
                            </div>
                            <span>someone is typing...</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </section>
  );
}
