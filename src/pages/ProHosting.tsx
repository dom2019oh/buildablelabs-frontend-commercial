import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Server, Zap, Shield, RefreshCw, Globe, Clock, Code2, Layers } from 'lucide-react';
import FloatingNav from '@/components/FloatingNav';
import { AmbientBg, G, GCard, onGE, onGL, tint, onTE, onTL, BH, BT, BTR, spring } from '@/lib/glass';

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

const INFRA = [
  { icon: Server,    label: 'Railway',     desc: 'Containerised on Railway — isolated per bot, no shared processes.' },
  { icon: Globe,     label: 'Cloudflare',  desc: 'All traffic routed through Cloudflare — DDoS protection out of the box.' },
  { icon: Shield,    label: 'Firebase',    desc: 'Auth, real-time database, and storage on Google infrastructure.' },
  { icon: Code2,     label: 'discord.py',  desc: 'Bots run native Python discord.py — not a wrapper, not a workaround.' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Zero-Config Deploy',
    body: 'Paste your bot token and hit deploy. No terminals, no YAML, no SSH. Buildable handles containerisation, secrets injection, and process management.',
  },
  {
    icon: RefreshCw,
    title: 'Instant Rebuilds',
    body: 'Describe a change in plain English. The AI pipeline regenerates your bot code and redeploys in seconds — a full hot-swap, no downtime.',
  },
  {
    icon: Clock,
    title: 'Always-On Uptime',
    body: 'Your bot runs 24/7 on a persistent process. No free-tier sleeping, no cold starts on the first message. Pro and Max plans include uptime monitoring.',
  },
  {
    icon: Layers,
    title: 'Isolated Containers',
    body: 'Every bot runs in its own container. A crash in one bot never affects another. Logs are per-bot and visible in your dashboard.',
  },
  {
    icon: Shield,
    title: 'Secrets Vault',
    body: 'Bot tokens and API keys are encrypted at rest and injected at runtime. They never appear in your code or version history.',
  },
  {
    icon: Globe,
    title: 'Multi-Server Ready',
    body: 'One hosted bot can serve unlimited Discord servers simultaneously. Invite it once and it scales horizontally as communities grow.',
  },
];

const STEPS = [
  { n: '01', title: 'Describe your bot', body: 'Type what you want in plain English. Commands, roles, logic — describe it like you\'d explain it to a developer.' },
  { n: '02', title: 'AI builds the code', body: 'The 8-stage pipeline plans, scaffolds, generates, and validates production-grade discord.py code.' },
  { n: '03', title: 'Add your bot token', body: 'Paste a Discord bot token from the Developer Portal. Buildable encrypts it and injects it at runtime.' },
  { n: '04', title: 'Live in seconds', body: 'Your bot comes online on Railway infrastructure, connected to Discord, ready to handle commands.' },
];

const TIERS = [
  { name: 'Free',   bots: '2 bots',     uptime: 'Best-effort',   rebuilds: '3 / day',     logs: '24h logs',     support: 'Community' },
  { name: 'Pro',    bots: '10 bots',    uptime: '99.5% SLA',     rebuilds: '30–300 / mo', logs: '7-day logs',   support: 'Email' },
  { name: 'Max',    bots: 'Unlimited',  uptime: '99.9% SLA',     rebuilds: '100–1k / mo', logs: '30-day logs',  support: 'Priority' },
];

export default function ProHosting() {
  return (
    <div style={{ background: '#06060b', minHeight: '100vh', position: 'relative' }}>
      <AmbientBg />
      <FloatingNav />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: '96px', paddingBottom: '96px' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">

          {/* ── Hero ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px', padding: '4px 14px', fontFamily: "'Geist', sans-serif",
              fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.04em', textTransform: 'uppercase' as const,
            }}>Pro Hosting</span>
          </motion.div>

          <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.07 }}
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: 'clamp(38px, 6vw, 62px)',
              fontWeight: 800, color: 'rgba(255,255,255,0.92)', textAlign: 'center',
              lineHeight: 1.12, marginBottom: '20px', letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
            }}>
            {'Your bot, always on.\nNo server required.'}
          </motion.h1>

          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.13 }}
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: '17px',
              color: 'rgba(255,255,255,0.38)', textAlign: 'center',
              maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.65,
            }}>
            Buildable deploys and hosts your Discord bot for you — on real infrastructure, with real uptime. No terminals, no Docker, no ops work.
          </motion.p>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.18 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '96px' }}>
            <motion.a
              href="/sign-up"
              whileHover={BH} whileTap={BT} transition={BTR}
              style={{ ...tint(109, 40, 217), borderRadius: '999px', padding: '12px 28px', fontSize: '15px', textDecoration: 'none' }}
              onMouseEnter={onTE(109, 40, 217)} onMouseLeave={onTL(109, 40, 217)}
            >
              Start for free
            </motion.a>
            <motion.a
              href="/pricing"
              whileHover={BH} whileTap={BT} transition={BTR}
              style={{ ...G, borderRadius: '999px', padding: '12px 28px', fontSize: '15px', textDecoration: 'none' }}
              onMouseEnter={onGE} onMouseLeave={onGL}
            >
              See pricing
            </motion.a>
          </motion.div>

          {/* ── How It Works ── */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ ...spring.enter }}
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: '22px', fontWeight: 700,
              color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '32px',
            }}>
            From description to live bot in 60 seconds
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '80px' }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ ...spring.enter, delay: i * 0.07 }}
                whileHover={{ y: -3, scale: 1.008 }}
                style={{
                  background: 'linear-gradient(170deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)',
                  backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.08)',
                  borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '12px',
                }}
              >
                <span style={{
                  fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 700,
                  color: 'rgba(109,40,217,0.7)', letterSpacing: '0.1em',
                }}>{step.n}</span>
                <h3 style={{
                  fontFamily: "'Geist', sans-serif", fontSize: '15px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.88)', margin: 0,
                }}>{step.title}</h3>
                <p style={{
                  fontFamily: "'Geist', sans-serif", fontSize: '13px',
                  color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0,
                }}>{step.body}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Features ── */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ ...spring.enter }}
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: '22px', fontWeight: 700,
              color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '32px',
            }}>
            Everything handled for you
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '80px' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ ...spring.enter, delay: i * 0.06 }}
                  whileHover={{ y: -3, scale: 1.007 }}
                  style={{
                    background: 'linear-gradient(170deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)',
                    backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.08)',
                    borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '14px',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color="rgba(167,139,250,0.85)" />
                  </div>
                  <h3 style={{
                    fontFamily: "'Geist', sans-serif", fontSize: '15px', fontWeight: 600,
                    color: 'rgba(255,255,255,0.88)', margin: 0,
                  }}>{f.title}</h3>
                  <p style={{
                    fontFamily: "'Geist', sans-serif", fontSize: '13px',
                    color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0,
                  }}>{f.body}</p>
                </motion.div>
              );
            })}
          </div>

          {/* ── Infrastructure ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ ...spring.enter }}
            style={{
              background: 'linear-gradient(170deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)',
              backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.08)',
              borderRadius: '20px', padding: '32px', marginBottom: '32px',
            }}
          >
            <p style={{
              fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 600,
              color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '24px',
            }}>Powered by</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
              {INFRA.map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={14} color="rgba(167,139,250,0.7)" />
                    <span style={{
                      fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 600,
                      color: 'rgba(255,255,255,0.7)',
                    }}>{label}</span>
                  </div>
                  <p style={{
                    fontFamily: "'Geist', sans-serif", fontSize: '12px',
                    color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0,
                  }}>{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Tier Comparison ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ ...spring.enter, delay: 0.06 }}
            style={{
              background: 'linear-gradient(170deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)',
              backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.08)',
              borderRadius: '20px', padding: '32px', marginBottom: '64px', overflowX: 'auto',
            }}
          >
            <h2 style={{
              fontFamily: "'Geist', sans-serif", fontSize: '17px', fontWeight: 700,
              color: 'rgba(255,255,255,0.85)', marginBottom: '24px',
            }}>Hosting by plan</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Geist', sans-serif" }}>
              <thead>
                <tr>
                  {['Plan', 'Bots', 'Uptime', 'Rebuilds', 'Logs', 'Support'].map((h, i) => (
                    <th key={h} style={{
                      textAlign: i === 0 ? 'left' : 'center', fontSize: '11px', fontWeight: 600,
                      color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.07em',
                      paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS.map((tier, i) => (
                  <tr key={tier.name}>
                    {[tier.name, tier.bots, tier.uptime, tier.rebuilds, tier.logs, tier.support].map((val, j) => (
                      <td key={j} style={{
                        textAlign: j === 0 ? 'left' : 'center',
                        padding: '14px 0',
                        borderBottom: i < TIERS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        fontSize: '13px',
                        fontWeight: j === 0 ? 600 : 400,
                        color: j === 0
                          ? (tier.name === 'Pro' ? 'rgba(167,139,250,0.9)' : tier.name === 'Max' ? 'rgba(253,186,116,0.9)' : 'rgba(255,255,255,0.65)')
                          : 'rgba(255,255,255,0.45)',
                      }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* ── Divider ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '64px' }} />

          {/* ── CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ ...spring.enter }}
            style={{ textAlign: 'center' }}
          >
            <h2 style={{
              fontFamily: "'Geist', sans-serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
              color: 'rgba(255,255,255,0.88)', marginBottom: '16px', letterSpacing: '-0.02em',
            }}>
              Deploy your first bot today.
            </h2>
            <p style={{
              fontFamily: "'Geist', sans-serif", fontSize: '15px',
              color: 'rgba(255,255,255,0.38)', marginBottom: '32px', lineHeight: 1.6,
            }}>
              Free plan. No credit card. Live in under a minute.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <motion.a
                href="/sign-up"
                whileHover={BH} whileTap={BT} transition={BTR}
                style={{ ...tint(109, 40, 217), borderRadius: '999px', padding: '12px 28px', fontSize: '15px', textDecoration: 'none' }}
                onMouseEnter={onTE(109, 40, 217)} onMouseLeave={onTL(109, 40, 217)}
              >
                Get started free
              </motion.a>
              <motion.a
                href="/pricing"
                whileHover={BH} whileTap={BT} transition={BTR}
                style={{ ...G, borderRadius: '999px', padding: '12px 28px', fontSize: '15px', textDecoration: 'none' }}
                onMouseEnter={onGE} onMouseLeave={onGL}
              >
                View pricing
              </motion.a>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
