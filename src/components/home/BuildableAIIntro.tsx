import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Shield, Bot } from 'lucide-react';

// ── Typewriter content ──────────────────────────────────────────────────────
const PROMPT = 'Build me a music bot with a queue, skip, and nowplaying command';

const CODE_OUTPUT = `import discord
from discord.ext import commands
import yt_dlp

bot = commands.Bot(command_prefix='!')
queue = []

@bot.command()
async def play(ctx, *, url):
    queue.append(url)
    if not ctx.voice_client.is_playing():
        await _play_next(ctx)
    await ctx.send(f'Added to queue: {url}')

@bot.command()
async def skip(ctx):
    ctx.voice_client.stop()
    await ctx.send('⏭  Skipped.')

@bot.command()
async def nowplaying(ctx):
    src = ctx.voice_client.source
    await ctx.send(f'🎵  Now playing: {src.title}')

bot.run(TOKEN)`;

// ── Floating capability tags ────────────────────────────────────────────────
const TAGS = [
  { label: 'discord.py',   x: '8%',   y: '18%', delay: 0.6 },
  { label: 'AWS Lambda',   x: '78%',  y: '10%', delay: 0.9 },
  { label: 'Auto-scaling', x: '88%',  y: '55%', delay: 1.1 },
  { label: 'Python 3.12',  x: '5%',   y: '70%', delay: 0.75 },
  { label: 'Slash Commands', x: '72%', y: '82%', delay: 1.3 },
  { label: 'OAuth2',        x: '20%',  y: '88%', delay: 1.0 },
];

// ── Stats ───────────────────────────────────────────────────────────────────
const STATS = [
  { value: '2,400+', label: 'Bots deployed',       icon: Bot },
  { value: '< 60s',  label: 'Average build time',  icon: Zap },
  { value: '99.9%',  label: 'Uptime guaranteed',   icon: Shield },
];

// ── Component ───────────────────────────────────────────────────────────────
export default function BuildableAIIntro() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inView      = useInView(sectionRef,  { once: true, margin: '-80px' });
  const termInView  = useInView(terminalRef, { once: true, margin: '-60px' });

  type Phase = 'idle' | 'typing-prompt' | 'thinking' | 'typing-code' | 'done';
  const [phase,       setPhase]       = useState<Phase>('idle');
  const [promptCount, setPromptCount] = useState(0);
  const [codeCount,   setCodeCount]   = useState(0);

  // Start typewriter when terminal enters view
  useEffect(() => {
    if (termInView && phase === 'idle') setPhase('typing-prompt');
  }, [termInView, phase]);

  // Typewriter state machine
  useEffect(() => {
    if (phase === 'typing-prompt') {
      if (promptCount < PROMPT.length) {
        const t = setTimeout(() => setPromptCount(p => p + 1), 28);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('thinking'), 700);
      return () => clearTimeout(t);
    }
    if (phase === 'thinking') {
      const t = setTimeout(() => setPhase('typing-code'), 1100);
      return () => clearTimeout(t);
    }
    if (phase === 'typing-code') {
      if (codeCount < CODE_OUTPUT.length) {
        const t = setTimeout(() => setCodeCount(c => Math.min(c + 3, CODE_OUTPUT.length)), 12);
        return () => clearTimeout(t);
      }
      setPhase('done');
    }
  }, [phase, promptCount, codeCount]);

  return (
    <section
      ref={sectionRef}
      className="relative py-36 px-6 overflow-hidden"
    >
      {/* ── Background layers ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(90,90,130,0.07) 0%, transparent 70%)',
        }}
      />
      {/* Horizontal separator lines */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />

      {/* ── Floating tags ── */}
      {TAGS.map((tag) => (
        <motion.div
          key={tag.label}
          className="absolute hidden lg:flex items-center px-3 py-1.5 rounded-full pointer-events-none"
          style={{
            left: tag.x, top: tag.y,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.04em',
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: tag.delay, ease: 'easeOut' }}
        >
          {tag.label}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Eyebrow + Headline ── */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="inline-block text-[11px] tracking-[0.22em] uppercase mb-5 px-3.5 py-1.5 rounded-full"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            The intelligence behind the build
          </span>

          <h2
            className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span style={{ color: 'rgba(255,255,255,0.92)' }}>Meet </span>
            <span
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(180,180,210,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Buildable AI
            </span>
          </h2>

          <p
            className="max-w-lg mx-auto text-base leading-relaxed"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(226,232,240,0.5)',
              fontSize: '1.05rem',
            }}
          >
            Describe your Discord bot in plain English. Our AI understands the API,
            writes production-ready Python, and deploys it — all in under a minute.
          </p>
        </motion.div>

        {/* ── Terminal ── */}
        <motion.div
          ref={terminalRef}
          initial={{ opacity: 0, y: 48, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="rounded-2xl overflow-hidden mb-14"
          style={{
            background: '#0c0c10',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111116' }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
            <span
              className="ml-3 text-xs"
              style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)' }}
            >
              buildable-ai — bot-generator
            </span>
            {/* Live indicator */}
            <div className="ml-auto flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#28c840' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="text-[11px]" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)' }}>
                live
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]" style={{ minHeight: '320px' }}>

            {/* Left — prompt */}
            <div className="p-7 flex flex-col">
              <div
                className="text-[11px] tracking-widest uppercase mb-4"
                style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}
              >
                user@buildable:~$
              </div>

              <div
                className="text-sm leading-relaxed flex-1"
                style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.72)' }}
              >
                {PROMPT.slice(0, promptCount)}
                {phase === 'typing-prompt' && (
                  <span
                    className="inline-block w-[2px] h-[13px] ml-px align-middle"
                    style={{ background: 'rgba(255,255,255,0.55)', animation: 'blink 0.9s step-end infinite' }}
                  />
                )}
              </div>

              {/* Thinking indicator */}
              {(phase === 'thinking' || phase === 'typing-code' || phase === 'done') && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-5 flex items-center gap-2.5"
                >
                  {phase === 'thinking' ? (
                    <>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'rgba(160,165,210,0.6)' }}
                            animate={{ opacity: [0.25, 1, 0.25] }}
                            transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs"
                        style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)' }}
                      >
                        Buildable AI is thinking...
                      </span>
                    </>
                  ) : (
                    <span
                      className="text-xs"
                      style={{ fontFamily: 'monospace', color: 'rgba(120,200,120,0.55)' }}
                    >
                      ✓ {phase === 'done' ? 'Bot ready — deploying...' : 'Generating bot code...'}
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right — code output */}
            <div className="p-7 relative overflow-hidden">
              <div
                className="text-[11px] tracking-widest uppercase mb-4"
                style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}
              >
                bot.py
              </div>

              {/* Syntax-tinted pre */}
              <pre
                className="text-xs leading-[1.75] overflow-hidden whitespace-pre-wrap break-words"
                style={{ fontFamily: 'monospace', color: 'rgba(160,220,160,0.82)' }}
              >
                {CODE_OUTPUT.slice(0, codeCount)}
                {phase === 'typing-code' && (
                  <span
                    className="inline-block w-[2px] h-[12px] ml-px align-middle"
                    style={{ background: 'rgba(160,220,160,0.7)', animation: 'blink 0.9s step-end infinite' }}
                  />
                )}
              </pre>

              {/* Done glow overlay */}
              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 pointer-events-none rounded-r-2xl"
                  style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(40,200,64,0.06) 0%, transparent 70%)',
                  }}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.5 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center rounded-2xl py-7 px-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <Icon className="w-4 h-4 mb-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.88)' }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.32)' }}
                >
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Blink keyframe */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </section>
  );
}
