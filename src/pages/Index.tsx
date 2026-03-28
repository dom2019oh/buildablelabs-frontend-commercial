import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Shield,
  Bot,
  ChevronDown,
  Send,
  Wand2,
  Rocket,
  LayoutGrid,
  Cloud,
  Layers,
  BarChart2,
  BookOpen,
  GraduationCap,
  Users,
  History,
  Heart,
  FileText,
  Briefcase,
  Mail,
  ArrowRight,
  Star,
  Plus,
  Mic,
  ArrowUp,
  UserPlus,
  Music,
  Tag,
  Gift,
  Gamepad2,
  Bell,
  Cake,
  Globe,
  MessageSquare,
  Github,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl, getSignUpUrl, getDashboardUrl } from "@/lib/urls";
import logoPng from "@/assets/buildable-logo.png";
import wordmarkSvg from "@/assets/buildable-wordmark.svg";
import openaiLogoPng from "@/assets/openai-logo.png";
import Grainient from "@/components/Grainient";
import SplitText from "@/components/SplitText";
import AIThinkingOrb from "@/components/AIThinkingOrb";
import BuildableSimulation from "@/components/home/BuildableSimulation";
import FloatingNav, { NAV_ENTRIES } from "@/components/FloatingNav";


// ─── Feature Ticker ───────────────────────────────────────────────────────────
function FeatureTicker() {
  const items: { icon: React.ElementType<{ className?: string }>; label: string }[] = [
    { icon: UserPlus,      label: "Welcome System" },
    { icon: Music,         label: "Music Playback" },
    { icon: Shield,        label: "Auto-Moderation" },
    { icon: Star,          label: "XP & Levels" },
    { icon: Tag,           label: "Ticket System" },
    { icon: Gift,          label: "Giveaways" },
    { icon: BarChart2,     label: "Analytics" },
    { icon: Gamepad2,      label: "Mini Games" },
    { icon: Bell,          label: "Role Alerts" },
    { icon: Cake,          label: "Birthdays" },
    { icon: Globe,         label: "Translation" },
    { icon: MessageSquare, label: "AI Replies" },
  ];
  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden py-2"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => {
          const Icon = item.icon;
          return (
            <span
              key={i}
              className="flex-shrink-0 text-[13px] flex items-center gap-2"
              style={{ color: "rgba(255,255,255,0.28)", fontFamily: "'Geist', 'DM Sans', sans-serif" }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
              {item.label}
              <span className="text-[9px]" style={{ color: "rgba(167,139,250,0.25)" }}>◆</span>
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
// ─── How It Works — individual step (scroll-reveal) ──────────────────────────
const PARTICLE_COUNT = 8;

function HowItWorksStep({
  icon,
  title,
  desc,
  isLast,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [particlesActive, setParticlesActive] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="relative flex gap-7"
      style={{ paddingBottom: isLast ? 0 : "6rem" }}
    >
      {/* Left column: dot + connecting line */}
      <div className="relative flex flex-col items-center" style={{ width: "44px", flexShrink: 0 }}>
        {/* Circle dot with icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "#000",
            boxShadow: "0 0 0 1.5px rgba(255,255,255,0.12)",
            color: "#fff",
            zIndex: 1,
          }}
        >
          {icon}
        </motion.div>

        {/* Connecting line + shooting comet */}
        {!isLast && (
          <div
            className="relative flex-1 mt-2"
            style={{ width: "2px", minHeight: "80px", background: "rgba(255,255,255,0.07)" }}
          >
            {/* Shooting comet */}
            {inView && (
              <motion.div
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ duration: 0.75, delay: 0.55, ease: [0.4, 0, 0.8, 1] }}
                onAnimationComplete={() => setParticlesActive(true)}
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "3px",
                  height: "36px",
                  background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.95) 100%)",
                  borderRadius: "9999px",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            )}

            {/* Particle burst + logo flash at bottom */}
            <AnimatePresence>
              {particlesActive && (
                <div style={{ position: "absolute", bottom: 0, left: "50%", pointerEvents: "none" }}>
                  {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
                    const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
                    return (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos(angle) * 22,
                          y: Math.sin(angle) * 22,
                          opacity: 0,
                          scale: 0.2,
                        }}
                        exit={{}}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          width: 4,
                          height: 4,
                          background: "#fff",
                          borderRadius: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    );
                  })}
                  {/* Buildable logo sparkle flash */}
                  <motion.img
                    src={logoPng}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.4, opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      width: 18,
                      height: 18,
                      transform: "translate(-50%, -50%)",
                      filter: "brightness(0) invert(1)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Right column: text content + image placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="pt-2 pb-2 flex-1 min-w-0"
      >
        <h3
          className="font-bold text-white mb-3"
          style={{ fontFamily: "'Geist', sans-serif", fontSize: "clamp(1.2rem, 2vw, 1.65rem)", lineHeight: 1.2 }}
        >
          {title}
        </h3>
        <p
          className="text-base leading-relaxed mb-6"
          style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: "rgba(255,255,255,0.92)", maxWidth: "430px" }}
        >
          {desc}
        </p>

        {/* Image placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            maxWidth: "430px",
            aspectRatio: "16 / 9",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(59,130,246,0.04) 100%)",
            border: "1px dashed rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column" as const,
            gap: "8px",
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.15)", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
            Image coming soon
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Bot Showcase (card shuffle) ─────────────────────────────────────────────
function BotShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-120px" });
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const TOTAL = 8;

  useEffect(() => {
    let t2: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      setLeaving(true);
      t2 = setTimeout(() => { setActive(p => (p + 1) % TOTAL); setLeaving(false); }, 380);
    }, 4000);
    return () => { clearInterval(t); clearTimeout(t2); };
  }, []);

  const FEATURES = ['Music Playback','Auto-Moderation','Welcome & Roles','Slash Commands','AI Conversations','Ticket System','Giveaways','Live Deployment'];

  const BG2 = '#313338';
  const MUTED = 'rgba(255,255,255,0.35)';
  const MSG = 'rgba(255,255,255,0.85)';
  const BLURPLE = '#5865f2';
  const F = "'DM Sans',sans-serif";

  // Sidebar channel list (shared across all cards)
  const Sidebar = () => (
    <div style={{ width: 56, background: '#1e1f22', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 6 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: BLURPLE, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: F }}>B</div>
      {['#','#','#','#'].map((_, i) => <div key={i} style={{ width: 32, height: 32, borderRadius: i === 0 ? 8 : '50%', background: i === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }} />)}
    </div>
  );

  // Channel header
  const ChanHead = ({ name }: { name: string }) => (
    <div style={{ height: 44, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6, flexShrink: 0 }}>
      <span style={{ color: MUTED, fontSize: 17 }}>#</span>
      <span style={{ color: MSG, fontSize: 14, fontWeight: 600, fontFamily: F }}>{name}</span>
    </div>
  );

  // Message row
  const Msg = ({ av, avC, name, nameC, bot, time, children }: { av: string; avC: string; name: string; nameC?: string; bot?: boolean; time: string; children?: any }) => (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12, padding: '0 16px', fontFamily: F }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: avC, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{av}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: nameC || MSG }}>{name}</span>
          {bot && <span style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(88,101,242,0.4)', borderRadius: 3, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>BOT</span>}
          <span style={{ fontSize: 11, color: MUTED }}>{time}</span>
        </div>
        {children}
      </div>
    </div>
  );

  // Embed
  const Embed = ({ color, children }: { color: string; children?: any }) => (
    <div style={{ borderLeft: `3px solid ${color}`, background: 'rgba(255,255,255,0.04)', borderRadius: '0 8px 8px 0', padding: '9px 12px', marginTop: 3 }}>
      {children}
    </div>
  );

  // Row inside embed
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', gap: 10, marginBottom: 3 }}>
      <span style={{ fontSize: 11, color: MUTED, minWidth: 62, fontFamily: F }}>{label}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', fontFamily: F }}>{value}</span>
    </div>
  );

  const CARDS = [
    /* 0 — Music */
    <div key="music" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="music-bot-test" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
          <Msg av="J" avC="rgba(124,58,237,0.8)" name="james" nameC="#c084fc" time="Today 3:41 PM">
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: F }}>!play Blinding Lights</div>
          </Msg>
          <Msg av="M" avC={BLURPLE} name="MusicBot" nameC={BLURPLE} bot time="Today 3:41 PM">
            <Embed color="#1db954">
              <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, letterSpacing: '0.07em', fontFamily: F }}>NOW PLAYING</div>
              <div style={{ fontSize: 14, color: MSG, fontWeight: 700, marginBottom: 1, fontFamily: F }}>Blinding Lights</div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 9, fontFamily: F }}>The Weeknd · 3:20</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 9 }}>
                <div style={{ width: '38%', height: '100%', background: '#1db954', borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', gap: 14 }}>{['⏮','⏸','⏭','🔀'].map(c => <span key={c} style={{ fontSize: 16 }}>{c}</span>)}</div>
            </Embed>
          </Msg>
        </div>
      </div>
    </div>,

    /* 1 — Moderation */
    <div key="mod" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="general" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
          <Msg av="S" avC="rgba(239,68,68,0.7)" name="spammer99" nameC="#f87171" time="Today 2:12 PM">
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', fontFamily: F }}>buy cheap discord nitro at best-deals.xyz...</div>
          </Msg>
          <Msg av="B" avC="rgba(239,68,68,0.8)" name="BuildableBot" nameC="#f87171" bot time="Today 2:12 PM">
            <Embed color="#ef4444">
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginBottom: 7, fontFamily: F }}>🛡️ Auto-moderation action</div>
              <Row label="User" value="spammer99#1234" />
              <Row label="Reason" value="Detected spam link" />
              <Row label="Action" value="Message deleted + 1h timeout" />
            </Embed>
          </Msg>
        </div>
      </div>
    </div>,

    /* 2 — Welcome */
    <div key="welcome" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="welcome" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 12 }}>
          <div style={{ textAlign: 'center', fontSize: 11, color: MUTED, marginBottom: 14, fontFamily: F }}>— alex_new joined the server —</div>
          <Msg av="B" avC={BLURPLE} name="BuildableBot" nameC={BLURPLE} bot time="Today 4:00 PM">
            <Embed color={BLURPLE}>
              <div style={{ fontSize: 14, color: MSG, fontWeight: 700, marginBottom: 4, fontFamily: F }}>Welcome to the server, alex_new! 👋</div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 10, lineHeight: 1.6, fontFamily: F }}>You're member #847. Pick your roles below to get started.</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['🎮 Gaming', '🎵 Music', '💻 Dev', '🎨 Art'].map(r => (
                  <div key={r} style={{ padding: '3px 10px', background: 'rgba(88,101,242,0.3)', borderRadius: 5, fontSize: 11, color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(88,101,242,0.5)', fontFamily: F }}>{r}</div>
                ))}
              </div>
            </Embed>
          </Msg>
        </div>
      </div>
    </div>,

    /* 3 — Slash commands */
    <div key="slash" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="bot-commands" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
          <Msg av="J" avC="rgba(124,58,237,0.8)" name="james" nameC="#c084fc" time="Today 5:22 PM">
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8, fontFamily: F }}>/</div>
            <div style={{ background: '#2b2d31', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              {([['/ play','Play a song or playlist'],['/ skip','Skip the current track'],['/ queue','View the queue'],['/ ban','Ban a member from the server']] as [string,string][]).map(([cmd,desc],i) => (
                <div key={cmd} style={{ display: 'flex', gap: 12, padding: '8px 12px', background: i === 0 ? 'rgba(88,101,242,0.2)' : 'transparent', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, minWidth: 64, fontFamily: F }}>{cmd}</span>
                  <span style={{ fontSize: 12, color: MUTED, fontFamily: F }}>{desc}</span>
                </div>
              ))}
            </div>
          </Msg>
        </div>
      </div>
    </div>,

    /* 4 — AI chat */
    <div key="ai" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="ai-chat" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
          <Msg av="D" avC="rgba(16,185,129,0.7)" name="dan_c" nameC="#6ee7b7" time="Today 1:15 PM">
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: F }}>@BuildableBot what's the capital of Japan?</div>
          </Msg>
          <Msg av="B" avC={BLURPLE} name="BuildableBot" nameC={BLURPLE} bot time="Today 1:15 PM">
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, fontFamily: F }}>
              The capital of Japan is <strong style={{ color: MSG }}>Tokyo</strong> (東京). It's the most populous metropolitan area in the world, home to over 37 million people.
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              {['👍 12', '🤔 2'].map(r => <span key={r} style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12, color: MUTED, border: '1px solid rgba(255,255,255,0.09)', fontFamily: F }}>{r}</span>)}
            </div>
          </Msg>
        </div>
      </div>
    </div>,

    /* 5 — Ticket system */
    <div key="ticket" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="support" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
          <Msg av="S" avC="rgba(251,191,36,0.7)" name="sarah_m" nameC="#fbbf24" time="Today 11:30 AM">
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: F }}>!ticket I can't access my account</div>
          </Msg>
          <Msg av="B" avC={BLURPLE} name="BuildableBot" nameC={BLURPLE} bot time="Today 11:30 AM">
            <Embed color="#fbbf24">
              <div style={{ fontSize: 13, color: MSG, fontWeight: 700, marginBottom: 7, fontFamily: F }}>🎫 Ticket #0042 created</div>
              <Row label="User" value="sarah_m#5541" />
              <Row label="Category" value="Account Access" />
              <Row label="Channel" value="#ticket-0042 (private)" />
              <div style={{ marginTop: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.12)', borderRadius: 5, fontSize: 11, color: '#fbbf24', fontFamily: F }}>A support agent will assist you shortly.</div>
            </Embed>
          </Msg>
        </div>
      </div>
    </div>,

    /* 6 — Giveaway */
    <div key="giveaway" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="giveaways" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
          <Msg av="B" avC={BLURPLE} name="BuildableBot" nameC={BLURPLE} bot time="Today 9:00 AM">
            <Embed color="#f59e0b">
              <div style={{ fontSize: 15, color: '#fbbf24', fontWeight: 800, marginBottom: 4, fontFamily: F }}>🎉 GIVEAWAY 🎉</div>
              <div style={{ fontSize: 14, color: MSG, fontWeight: 700, marginBottom: 7, fontFamily: F }}>Discord Nitro (1 Year)</div>
              <Row label="Ends in" value="23h 59m 48s" />
              <Row label="Hosted by" value="james#0001" />
              <Row label="Winners" value="1 winner" />
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ padding: '4px 12px', background: 'rgba(245,158,11,0.2)', borderRadius: 12, fontSize: 13, border: '1px solid rgba(245,158,11,0.4)' }}>🎉 <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: F }}>142 entries</span></div>
                <span style={{ fontSize: 11, color: MUTED, fontFamily: F }}>React to enter</span>
              </div>
            </Embed>
          </Msg>
        </div>
      </div>
    </div>,

    /* 7 — Live */
    <div key="live" style={{ height: '100%', display: 'flex', background: BG2 }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChanHead name="bot-status" />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
          <Msg av="B" avC={BLURPLE} name="BuildableBot" nameC={BLURPLE} bot time="Just now">
            <Embed color="#22c55e">
              <div style={{ fontSize: 14, color: '#4ade80', fontWeight: 700, marginBottom: 8, fontFamily: F }}>✅ Your bot is live!</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 12, color: MUTED, fontFamily: F }}>BuildableBot#1337 is online</span>
              </div>
              <Row label="Uptime" value="100%" />
              <Row label="Latency" value="43ms" />
              <Row label="Servers" value="1 connected" />
              <div style={{ marginTop: 6, fontSize: 11, color: MUTED, fontFamily: F }}>Invite link ready · buildablelabs.dev/invite</div>
            </Embed>
          </Msg>
        </div>
      </div>
    </div>,
  ];

  return (
    <section ref={sectionRef} className="relative w-full" style={{ zIndex: 10 }}>
      <div className="max-w-6xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — heading */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p style={{ fontSize: 11, fontFamily: "'Geist','DM Sans',sans-serif", color: 'rgba(167,139,250,0.55)', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }}>
              Simulator
            </p>
            <h2 style={{ fontFamily: "'Geist',sans-serif", fontSize: 'clamp(2rem,3.8vw,3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
              Your bot, doing<br />what you imagined.
            </h2>
            <p style={{ fontFamily: "'Geist','DM Sans',sans-serif", fontSize: 15, color: 'rgba(148,163,184,0.6)', lineHeight: 1.7, maxWidth: 340, marginBottom: 32 }}>
              From music playback to AI replies — describe it once and your bot handles it automatically, 24/7.
            </p>

            {/* Feature cycling pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', boxShadow: '0 0 10px rgba(37,99,235,0.5)', flexShrink: 0 }} />
              <div style={{ height: 28, overflow: 'hidden', position: 'relative', minWidth: 160 }}>
                <motion.div
                  key={active}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ fontFamily: "'Geist','DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.65)', lineHeight: '28px', whiteSpace: 'nowrap' }}
                >
                  {FEATURES[active]}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right — card stack */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 520, height: 320 }}>
              {/* Ghost cards */}
              <div style={{ position: 'absolute', inset: 0, background: '#252628', borderRadius: 16, transform: 'translateY(16px) scale(0.91) rotate(2.8deg)', zIndex: 1, border: '1px solid rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'absolute', inset: 0, background: '#2b2d30', borderRadius: 16, transform: 'translateY(8px) scale(0.955) rotate(-1.4deg)', zIndex: 2, border: '1px solid rgba(255,255,255,0.05)' }} />
              {/* Active card */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 3,
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                transform: leaving ? 'translateY(-32px) scale(0.95)' : 'translateY(0) scale(1)',
                opacity: leaving ? 0 : 1,
                transition: 'transform 0.36s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease',
              }}>
                {CARDS[active]}
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (!leaving) { setLeaving(true); setTimeout(() => { setActive(i); setLeaving(false); }, 380); } }}
                  style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, background: i === active ? '#2563EB' : 'rgba(255,255,255,0.14)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function HowItWorks() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  const steps = [
    {
      icon: <UserPlus className="w-5 h-5" />,
      title: "Create Your Account",
      desc: "To get started, just make an account or log in if you already have one.",
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: "Create a New Bot",
      desc: 'Open the dashboard and select "New Custom Bot" and follow the steps from the Tutorial.',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Connect the Discord Portal",
      desc: "Go to the Discord Developer Portal and add your Bot Token and Client ID following the Guide.",
    },
    {
      icon: <Wand2 className="w-5 h-5" />,
      title: "Customize & Start Prompting",
      desc: "Customize your bot profile, choose how many commands you want in sync — and boom, you're ready to start prompting.",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Describe, Customize & Edit",
      desc: "Just describe your idea, the image you want your bot to have and its function — Buildable AI analyzes your ideas and turns them into reality. You also have access to the code if you wish to make manual edits.",
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "Hit Publish. We Handle the Rest.",
      desc: "Once you finish, just hit publish and we host your bot for free. As simple as that — no errors, no \"I'm not sure what that does\". Just pure simplicity. Welcome to Buildable. Start building your dream.",
    },
  ];

  return (
    <section className="relative w-full" style={{ zIndex: 10 }}>
      {/* Top divider */}
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="w-full h-px mb-24 origin-left"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)" }}
        />
      </div>

      {/* Two-column sticky layout */}
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* LEFT — sticky heading */}
        <div ref={headingRef} className="md:sticky md:top-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-5"
              style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: "rgba(167,139,250,0.55)", fontWeight: 500 }}
            >
              How It Works
            </p>
            <h2
              className="font-bold text-white mb-5 leading-tight"
              style={{ fontFamily: "'Geist', sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}
            >
              How it works
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: "rgba(148,163,184,0.6)", maxWidth: "340px" }}
            >
              From a single sentence to a fully hosted Discord bot — in seconds. No code, no servers, no headaches.
            </p>
          </motion.div>
        </div>

        {/* RIGHT — scrolling timeline steps */}
        <div className="py-4">
          {steps.map((step, i) => (
            <HowItWorksStep
              key={i}
              icon={step.icon}
              title={step.title}
              desc={step.desc}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="pb-24" />
    </section>
  );
}

// ─── Tech Logos Marquee ───────────────────────────────────────────────────────
function TechLogos() {
  const logos: { name: string; src: string; noFilter?: boolean }[] = [
    { name: "GitHub",            src: "https://cdn.simpleicons.org/github" },
    { name: "Railway",           src: "https://cdn.simpleicons.org/railway" },
    { name: "Discord",           src: "https://cdn.simpleicons.org/discord" },
    { name: "Squarespace",       src: "https://cdn.simpleicons.org/squarespace" },
    { name: "OpenAI",            src: openaiLogoPng },
    { name: "Anthropic",         src: "https://cdn.simpleicons.org/anthropic" },
    { name: "Gemini",            src: "https://cdn.simpleicons.org/googlegemini" },
    { name: "ElevenLabs",        src: "https://cdn.simpleicons.org/elevenlabs" },
    { name: "Firebase",          src: "https://cdn.simpleicons.org/firebase" },
    { name: "Cloudflare",        src: "https://cdn.simpleicons.org/cloudflare" },
    { name: "Grant Development", src: "/grant-dev-logo.png", noFilter: true },
  ];
  const doubled = [...logos, ...logos];

  return (
    <section className="relative py-16 max-w-5xl mx-auto px-6" style={{ zIndex: 10 }}>
      {/* Label */}
      <p
        className="text-center text-[12px] uppercase tracking-[0.28em] mb-10"
        style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: "rgba(255,255,255,0.95)", fontWeight: 500 }}
      >
        Powered by Trusted 3rd Party Enhancements
      </p>

      {/* Marquee */}
      <div
        className="w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "64px",
            whiteSpace: "nowrap",
            animation: "marqueeScroll 38s linear infinite",
            willChange: "transform",
          }}
        >
          {doubled.map((logo, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2.5 shrink-0 cursor-default"
              style={{ opacity: 0.82, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.82")}
            >
              <img
                src={logo.src}
                alt={logo.name}
                draggable={false}
                className="select-none object-contain"
                style={{
                  height: "26px",
                  width: "auto",
                  maxWidth: "100px",
                  filter: logo.noFilter ? "none" : "brightness(0) invert(1)",
                }}
              />
              <span
                className="text-[11px] font-medium tracking-wide"
                style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: "rgba(255,255,255,0.92)" }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

// ─── Features Bento Grid ──────────────────────────────────────────────────────
type BentoCardData = {
  id: string;
  category: string;
  title: string;
  desc: string;
  icon: React.ElementType<{ className?: string }>;
  accent: string;
  bg: string;
  border: string;
  glow: string;
  large?: boolean;
};

const BENTO_CARDS: BentoCardData[] = [
  {
    id: "builder",
    category: "AI Core",
    title: "Vibe Code Your Bot",
    desc: "Just describe it in plain English. AI writes every command, response, and logic flow.",
    icon: Wand2,
    accent: "#c084fc",
    bg: "rgba(109,40,217,0.1)",
    border: "rgba(167,139,250,0.25)",
    glow: "rgba(109,40,217,0.25)",
  },
  {
    id: "deploy",
    category: "Infrastructure",
    title: "Deploy in Seconds",
    desc: "From your first prompt to a live Discord bot. Our cloud handles scaling, uptime, and updates automatically — no DevOps, no config, no drama.",
    icon: Rocket,
    accent: "#2dd4bf",
    bg: "rgba(20,184,166,0.08)",
    border: "rgba(45,212,191,0.22)",
    glow: "rgba(20,184,166,0.22)",
    large: true,
  },
  {
    id: "templates",
    category: "Quick Start",
    title: "50+ Templates",
    desc: "Battle-tested bot starters for every server type.",
    icon: Bot,
    accent: "#818cf8",
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(129,140,248,0.22)",
    glow: "rgba(99,102,241,0.2)",
  },
  {
    id: "moderation",
    category: "Safety",
    title: "Smart Moderation",
    desc: "AI-powered spam detection, toxicity filtering, and automated rule enforcement — running 24/7. Configure it in a single sentence.",
    icon: Shield,
    accent: "#f87171",
    bg: "rgba(239,68,68,0.07)",
    border: "rgba(248,113,113,0.2)",
    glow: "rgba(239,68,68,0.18)",
    large: true,
  },
  {
    id: "analytics",
    category: "Insights",
    title: "Analytics",
    desc: "Commands, retention, and engagement — at a glance.",
    icon: Sparkles,
    accent: "#facc15",
    bg: "rgba(234,179,8,0.08)",
    border: "rgba(250,204,21,0.2)",
    glow: "rgba(234,179,8,0.15)",
  },
  {
    id: "integrations",
    category: "Connect",
    title: "Integrations",
    desc: "Spotify, Twitch, GitHub, YouTube, and more.",
    icon: Zap,
    accent: "#60a5fa",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(96,165,250,0.2)",
    glow: "rgba(59,130,246,0.15)",
  },
];

function BentoCard({
  card,
  active,
  dimmed,
  onClick,
  delay,
  inView,
}: {
  card: BentoCardData;
  active: boolean;
  dimmed: boolean;
  onClick: () => void;
  delay: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const IconComp = card.icon;

  return (
    <div
      style={{
        gridArea: card.id,
        opacity: dimmed ? 0.38 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={onClick}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex flex-col cursor-pointer rounded-[1.15rem] overflow-hidden select-none h-full"
        style={{
          minHeight: card.large ? "240px" : "155px",
          padding: card.large ? "1.65rem" : "1.2rem",
          backgroundColor: active ? "#1e1a2a" : hovered ? "#181820" : "#141416",
          border: `1px solid ${
            active
              ? card.border
              : hovered
              ? "rgba(255,255,255,0.10)"
              : "rgba(255,255,255,0.06)"
          }`,
          boxShadow: active
            ? `0 0 40px ${card.glow}, 0 8px 32px rgba(0,0,0,0.5)`
            : hovered
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 2px 12px rgba(0,0,0,0.3)",
          transition: "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {/* Mouse spotlight */}
        {(hovered || active) && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(200px at ${pos.x}px ${pos.y}px, ${card.glow.replace(/[\d.]+\)$/, "0.18)")}, transparent 70%)`,
            }}
          />
        )}

        {/* Category label — top left */}
        <span
          className="relative z-10 text-[11px] tracking-[0.12em] uppercase font-medium"
          style={{
            color: card.accent,
            opacity: active ? 0.9 : 0.52,
            fontFamily: "'Geist', 'DM Sans', sans-serif",
          }}
        >
          {card.category}
        </span>

        {/* Spacer pushes content to bottom */}
        <div className="flex-1" style={{ minHeight: "20px" }} />

        {/* Icon */}
        <motion.div
          animate={{ scale: active ? 1.18 : 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 mb-2.5"
          style={{ color: card.accent }}
        >
          <IconComp className={card.large ? "w-6 h-6" : "w-5 h-5"} />
        </motion.div>

        {/* Title */}
        <h3
          className="relative z-10 font-bold text-white leading-tight"
          style={{
            fontSize: card.large ? "1.28rem" : "0.97rem",
            marginBottom: "0.3rem",
          }}
        >
          {card.title}
        </h3>

        {/* Description */}
        <p
          className="relative z-10 leading-relaxed"
          style={{
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            fontSize: "0.82rem",
            color: "rgba(148,163,184,0.62)",
            lineHeight: 1.55,
          }}
        >
          {card.desc}
        </p>

        {/* Active indicator dot */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full"
              style={{ background: card.accent, boxShadow: `0 0 8px ${card.accent}` }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function FeaturesGrid() {
  const [active, setActive] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative px-6 py-24 max-w-5xl mx-auto" style={{ zIndex: 10 }}>
      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        className="w-full h-px mb-16 origin-left"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <p
          className="text-[11px] uppercase tracking-[0.3em] mb-4"
          style={{
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            color: "rgba(167,139,250,0.5)",
            fontWeight: 500,
          }}
        >
          Platform
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Everything your bot needs, built in seconds.
        </h2>
      </motion.div>

      {/* Bento grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateAreas: `
            "builder    deploy       deploy"
            "templates  deploy       deploy"
            "moderation moderation   analytics"
            "moderation moderation   integrations"
          `,
          gap: "10px",
        }}
      >
        {BENTO_CARDS.map((card, i) => (
          <BentoCard
            key={card.id}
            card={card}
            active={active === card.id}
            dimmed={active !== null && active !== card.id}
            onClick={() => setActive(active === card.id ? null : card.id)}
            delay={0.08 + i * 0.09}
            inView={inView}
          />
        ))}
      </div>

      {/* Click-to-deselect hint */}
      <AnimatePresence>
        {active && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="text-center mt-5 text-[12px] text-slate-700 cursor-pointer hover:text-slate-500 transition-colors"
            style={{ fontFamily: "'Geist', 'DM Sans', sans-serif" }}
            onClick={() => setActive(null)}
          >
            Click anywhere to deselect
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Bot Prompts + Suggestion Pills ──────────────────────────────────────────
const BOT_PROMPTS = [
  "Create a welcome bot that DMs new members with a custom greeting...",
  "Build a music bot that streams Spotify tracks in voice channels...",
  "Make a moderation bot that auto-removes spam and toxic messages...",
  "Design a level system with XP, custom ranks, and leaderboards...",
  "Create a ticket system for managing community support requests...",
  "Build a birthday bot that celebrates member anniversaries daily...",
  "Make a giveaway bot with fair, transparent random winner selection...",
  "Create a trivia bot with 10+ topic categories and live scoring...",
];

const SUGGESTION_PILLS: { icon: React.ElementType<{ className?: string }>; label: string }[] = [
  { icon: UserPlus, label: "Welcome bot" },
  { icon: Music,    label: "Music bot" },
  { icon: Shield,   label: "Moderation bot" },
  { icon: Star,     label: "Level system" },
  { icon: Tag,      label: "Ticket system" },
  { icon: Gift,     label: "Giveaway bot" },
];

// ─── Footer ───────────────────────────────────────────────────────────────────
function SiteFooter() {
  const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ];

  const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
    {
      label: "Discord",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.012.043.028.054a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
      ),
    },
    {
      label: "X / Twitter",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.845L1.254 2.25H8.08l4.259 5.623 5.905-5.623Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "GitHub",
      href: "#",
      icon: <Github size={17} />,
    },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
        zIndex: 10,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Main footer grid */}
      <div className="max-w-6xl mx-auto px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* ── Brand column ── */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/logo-stack-white.svg" alt="" aria-hidden style={{ height: '18px', width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
              <img src={wordmarkSvg} alt="Buildable Labs" style={{ height: '18px', width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
            </div>
            <p
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                color: "rgba(255,255,255,0.52)",
                fontSize: "0.9rem",
                lineHeight: 1.75,
                maxWidth: "270px",
              }}
            >
              Build Discord bots by just typing. No code, no servers — just your imagination and a prompt.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-7">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.65)",
                    transition: "background 0.2s, color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.14)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Nav columns from NAV_ENTRIES ── */}
          {NAV_ENTRIES.map((entry) => (
            <div key={entry.label}>
              <h4
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "1.1rem",
                  fontWeight: 700,
                }}
              >
                {entry.label}
              </h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {entry.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      style={{
                        fontFamily: "'Geist', 'DM Sans', sans-serif",
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.62)",
                        textDecoration: "none",
                        transition: "color 0.18s",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.62)")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legal column */}
          <div>
            <h4
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "1.1rem",
                    fontWeight: 700,
              }}
            >
              Legal
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy",   href: "/privacy" },
                { label: "Contact",          href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    style={{
                      fontFamily: "'Geist', 'DM Sans', sans-serif",
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.62)",
                      textDecoration: "none",
                      transition: "color 0.18s",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.62)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <span
            style={{
              fontFamily: "'Geist', 'DM Sans', sans-serif",
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            © 2026 Buildable Labs. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                style={{
                  fontFamily: "'Geist', 'DM Sans', sans-serif",
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                  transition: "color 0.18s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.75)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#080a0c" }}>
      {/* ── Grainient granite background ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Grainient
          color1="#3a3c42"
          color2="#141518"
          color3="#252729"
          timeSpeed={0.35}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative" style={{ zIndex: 10 }}>
        <FloatingNav />

        {/* ══════════════ HERO ══════════════ */}
        <section className="relative min-h-screen flex items-center px-6 md:px-16 overflow-hidden">
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 py-24">

            {/* ── Left: Orb ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="flex-shrink-0 flex items-center justify-center w-full md:w-auto"
            >
              <AIThinkingOrb />
            </motion.div>

            {/* ── Right: Text + CTAs ── */}
            <div className="flex flex-col items-start text-left flex-1">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-5"
              >
                <span
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] tracking-wide"
                  style={{
                    fontFamily: "'Geist', 'DM Sans', sans-serif",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  ✦ AI-Powered Bot Builder
                </span>
              </motion.div>

              {/* Headline */}
              <div className="mb-4 overflow-hidden">
                <h1 className="leading-[1.2] tracking-tight font-extrabold" style={{ fontFamily: "'Geist', sans-serif" }}>
                  <SplitText
                    text="Build a Bot today"
                    splitType="chars"
                    tag="span"
                    className="text-white"
                    style={{ fontSize: "clamp(2.4rem, 4.5vw, 4.2rem)", fontWeight: 800 }}
                    delay={38}
                    duration={0.6}
                    ease="power3.out"
                  />
                </h1>
              </div>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65 }}
                className="mb-8 max-w-md leading-relaxed"
                style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: "1.05rem", fontWeight: 400, color: "rgba(226,232,240,0.65)" }}
              >
                No code. No developers. No limits. Describe your bot and Buildable Labs builds, deploys, and hosts it — instantly.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.85 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <a
                  href={getSignUpUrl()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200"
                  style={{
                    fontFamily: "'Geist', 'DM Sans', sans-serif",
                    background: "rgba(255,255,255,0.92)",
                    color: "#0a0a0e",
                    boxShadow: "0 2px 16px rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}
                >
                  Start Building <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200"
                  style={{
                    fontFamily: "'Geist', 'DM Sans', sans-serif",
                    color: "rgba(255,255,255,0.65)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                >
                  View Pricing
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════ BUILDABLE AI INTRO ══════════════ */}
        <BuildableSimulation />

        {/* ══════════════ BOT SHOWCASE CARDS ══════════════ */}
        <BotShowcaseSection />

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <HowItWorks />

        {/* ══════════════ TECH LOGOS ══════════════ */}
        <TechLogos />

        {/* ══════════════ FEATURES GRID ══════════════ */}
        <FeaturesGrid />

        {/* ══════════════ FOOTER ══════════════ */}
        <SiteFooter />
      </div>
    </div>
  );
}
