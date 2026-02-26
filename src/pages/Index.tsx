import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import wordmarkSvg from "@/assets/buildable-wordmark.svg";
import logoPng from "@/assets/buildable-logo.png";
import openaiLogoPng from "@/assets/openai-logo.png";
import Grainient from "@/components/Grainient";
import SplitText from "@/components/SplitText";

// ─── Nav dropdown data ────────────────────────────────────────────────────────
type DropItem = { label: string; href: string; icon: React.ElementType<{ className?: string }> };
type NavEntry = { label: string; items: DropItem[] };

const NAV_ENTRIES: NavEntry[] = [
  {
    label: "Solutions",
    items: [
      { label: "Bot Builder",  href: "/",          icon: Bot },
      { label: "Templates",    href: "/explore",   icon: LayoutGrid },
      { label: "Pro Hosting",  href: "/pricing",   icon: Cloud },
      { label: "Multi-Bot",    href: "/pricing",   icon: Layers },
      { label: "Analytics",    href: "/dashboard", icon: BarChart2 },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Documentation", href: "/docs",    icon: BookOpen },
      { label: "Tutorials",     href: "/docs",    icon: GraduationCap },
      { label: "Community",     href: "/explore", icon: Users },
      { label: "Changelog",     href: "/docs",    icon: History },
    ],
  },
  {
    label: "About",
    items: [
      { label: "Our Story", href: "/",    icon: Heart },
      { label: "Blog",      href: "/docs", icon: FileText },
      { label: "Careers",   href: "/",    icon: Briefcase },
      { label: "Contact",   href: "/",    icon: Mail },
    ],
  },
];

// ─── Dropdown Nav ─────────────────────────────────────────────────────────────
function DropNav() {
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(label);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  return (
    <div className="flex items-center gap-0.5">
      {NAV_ENTRIES.map((entry) => (
        <div
          key={entry.label}
          className="relative"
          onMouseEnter={() => handleEnter(entry.label)}
          onMouseLeave={handleLeave}
        >
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-200 hover:bg-white/[0.06]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              color: open === entry.label ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.78)",
            }}
          >
            {entry.label}
            <ChevronDown
              className="w-3 h-3 transition-transform duration-200"
              style={{ transform: open === entry.label ? "rotate(180deg)" : "none", opacity: 0.5 }}
            />
          </button>

          <AnimatePresence>
            {open === entry.label && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute left-0 top-full mt-1.5 w-48 rounded-xl overflow-hidden"
                style={{
                  zIndex: 200,
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                }}
                onMouseEnter={() => handleEnter(entry.label)}
                onMouseLeave={handleLeave}
              >
                <div className="py-1.5">
                  {entry.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setOpen(null)}
                        className="flex items-center gap-2.5 px-3.5 py-2 transition-colors duration-100 group"
                        style={{ color: "rgba(255,255,255,0.72)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.055)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon className="w-[15px] h-[15px] shrink-0" style={{ color: "rgba(255,255,255,0.38)" }} />
                        <span
                          className="text-[13px] font-normal leading-none group-hover:text-white transition-colors"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Direct Pricing link */}
      <Link
        to="/pricing"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-200 hover:bg-white/[0.06]"
        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.78)" }}
      >
        Pricing
      </Link>
    </div>
  );
}

// ─── Floating Nav ─────────────────────────────────────────────────────────────
// Full-width Lovable-style top bar
function FloatingNav() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-[58px] flex items-center px-6 md:px-10"
      style={{
        background: scrolled ? "rgba(12, 6, 28, 0.65)" : "transparent",
        backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease",
      }}
    >
      {/* LEFT: Logo + wordmark */}
      <Link to="/" className="flex items-center gap-[10px] flex-shrink-0 mr-8">
        <img
          src={logoPng}
          alt=""
          aria-hidden
          draggable={false}
          className="select-none block"
          style={{
            height: "32px",
            width: "32px",
            objectFit: "contain",
            filter: "invert(1)",
            flexShrink: 0,
          }}
        />
        <img
          src={wordmarkSvg}
          alt="Buildable Labs"
          draggable={false}
          className="select-none block"
          style={{
            height: "30px",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </Link>

      {/* CENTER: nav links */}
      <div className="hidden md:flex items-center flex-1">
        <DropNav />
      </div>

      {/* RIGHT: CTA */}
      <div className="ml-auto flex items-center gap-4 flex-shrink-0">
        {user ? (
          <Link
            to="/dashboard"
            className="text-[13px] font-medium text-white/70 hover:text-white transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Dashboard →
          </Link>
        ) : (
          <>
            <Link
              to="/log-in"
              className="hidden sm:block text-[13px] text-white/60 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Log in
            </Link>
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/dashboard"
                className="inline-flex items-center text-[13px] font-semibold text-[#0a0514] px-4 py-[7px] rounded-full"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: "#ffffff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                  letterSpacing: "-0.01em",
                }}
              >
                Open Dashboard
              </Link>
            </motion.span>
          </>
        )}
      </div>
    </motion.header>
  );
}


// ─── Cursor Glow ──────────────────────────────────────────────────────────────
function CursorGlow() {
  const cx = useMotionValue(-80);
  const cy = useMotionValue(-80);
  const sx = useSpring(cx, { stiffness: 140, damping: 22 });
  const sy = useSpring(cy, { stiffness: 140, damping: 22 });

  useEffect(() => {
    const fn = (e: MouseEvent) => { cx.set(e.clientX - 24); cy.set(e.clientY - 24); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [cx, cy]);

  return (
    <motion.div
      className="fixed pointer-events-none rounded-full"
      style={{
        x: sx, y: sy,
        width: 48, height: 48,
        background: "radial-gradient(circle, rgba(167,139,250,0.6) 0%, rgba(124,58,237,0.22) 45%, transparent 70%)",
        filter: "blur(8px)",
        zIndex: 9999,
        mixBlendMode: "screen",
      }}
    />
  );
}

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
              style={{ color: "rgba(255,255,255,0.28)", fontFamily: "'DM Sans', sans-serif" }}
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
function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      num: "01",
      icon: <Wand2 className="w-5 h-5" />,
      color: { bg: "rgba(109,40,217,0.1)", border: "rgba(109,40,217,0.18)", text: "#a78bfa", glow: "rgba(109,40,217,0.12)" },
      title: "Describe in Plain English",
      desc: "Tell Buildable what your bot should do. No technical knowledge needed — just type like you're texting a friend.",
    },
    {
      num: "02",
      icon: <Zap className="w-5 h-5" />,
      color: { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.18)", text: "#818cf8", glow: "rgba(99,102,241,0.1)" },
      title: "AI Writes the Code",
      desc: "Our engine generates production-ready Python code using discord.py in seconds. Clean, documented, extensible.",
    },
    {
      num: "03",
      icon: <Rocket className="w-5 h-5" />,
      color: { bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.18)", text: "#2dd4bf", glow: "rgba(20,184,166,0.08)" },
      title: "Deploy & Go Live",
      desc: "One click. Your bot is live, hosted 24/7, serving thousands of members without touching a single server.",
    },
  ];

  return (
    <section ref={ref} className="relative px-6 py-24 max-w-5xl mx-auto" style={{ zIndex: 10 }}>
      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        className="w-full h-px mb-16 origin-left"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <p
          className="text-[11px] uppercase tracking-[0.3em] mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(167,139,250,0.5)", fontWeight: 500 }}
        >
          How It Works
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          From idea to live bot in three steps.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.14 }}
            whileHover={{ y: -4, transition: { duration: 0.22 } }}
            className="relative rounded-2xl p-6"
            style={{
              background: "#141416",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: step.color.bg, border: `1px solid ${step.color.border}`, color: step.color.text }}
              >
                {step.icon}
              </span>
              <span
                className="text-5xl font-bold select-none"
                style={{ color: "rgba(255,255,255,0.04)" }}
              >
                {step.num}
              </span>
            </div>
            <h3 className="text-white font-bold text-base mb-2">
              {step.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Tech Logos Marquee ───────────────────────────────────────────────────────
function TechLogos() {
  const logos: { name: string; src: string }[] = [
    { name: "GitHub",      src: "https://cdn.simpleicons.org/github" },
    { name: "Railway",     src: "https://cdn.simpleicons.org/railway" },
    { name: "Discord",     src: "https://cdn.simpleicons.org/discord" },
    { name: "Squarespace", src: "https://cdn.simpleicons.org/squarespace" },
    { name: "OpenAI",      src: openaiLogoPng },
    { name: "Anthropic",   src: "https://cdn.simpleicons.org/anthropic" },
    { name: "Gemini",      src: "https://cdn.simpleicons.org/googlegemini" },
    { name: "ElevenLabs",  src: "https://cdn.simpleicons.org/elevenlabs" },
  ];
  const doubled = [...logos, ...logos];

  return (
    <section className="relative py-16 max-w-5xl mx-auto px-6" style={{ zIndex: 10 }}>
      {/* Label */}
      <p
        className="text-center text-[12px] uppercase tracking-[0.28em] mb-10"
        style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.95)", fontWeight: 500 }}
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
        <motion.div
          className="flex items-center gap-16 whitespace-nowrap"
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((logo, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2.5 shrink-0 group cursor-default"
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
                  filter: "brightness(0) invert(1)",
                }}
              />
              <span
                className="text-[11px] font-medium tracking-wide"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.92)" }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
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
            fontFamily: "'DM Sans', sans-serif",
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
            fontFamily: "'DM Sans', sans-serif",
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
            fontFamily: "'DM Sans', sans-serif",
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
            style={{ fontFamily: "'DM Sans', sans-serif" }}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const id = setInterval(() => setPromptIdx((p) => (p + 1) % BOT_PROMPTS.length), 3600);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = () => {
    if (prompt.trim()) navigate(user ? "/dashboard" : "/sign-up");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const fillPrompt = (label: string) => {
    setPrompt(`Create a ${label} for my Discord server`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#150d22" }}>
      {/* ── Grainient granite background ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Grainient
          color1="#f291ef"
          color2="#664ec6"
          color3="#B19EEF"
          timeSpeed={0.75}
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

      {/* Cursor glow */}
      <CursorGlow />

      {/* ── Content ── */}
      <div className="relative" style={{ zIndex: 10 }}>
        <FloatingNav />

        {/* ══════════════ HERO ══════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-40 pb-40 text-center overflow-hidden">

          {/* Headline — SplitText stagger reveal */}
          <div className="relative z-10 mb-4 max-w-3xl text-center overflow-hidden">
            <h1 className="leading-[1.25] tracking-tight font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
              <SplitText
                text="Build a Bot today"
                splitType="chars"
                tag="span"
                className="text-white whitespace-nowrap"
                style={{ fontSize: "clamp(2rem, 4vw, 3.6rem)", fontWeight: 800 }}
                delay={38}
                duration={0.6}
                ease="power3.out"
              />
            </h1>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.68 }}
            className="relative z-10 max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.1rem", fontWeight: 400, color: "rgba(226,232,240,0.72)" }}
          >
            No code. No developers. No limits. Describe your bot and Buildable
            Labs builds, deploys, and hosts it — instantly.
          </motion.p>

          {/* ── PROMPT BOX (Lovable-style, big & prominent) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.82 }}
            className="relative z-10 w-full max-w-3xl mx-auto mb-5"
          >
            {/* ── Animated rim glow wrapper ── */}
            <div
              style={{
                position: "relative",
                padding: "1.5px",
                borderRadius: "17px",
                overflow: "hidden",
              }}
            >
              {/* Layer 1: Colorful gradient rim — pink → purple → indigo → blue */}
              <div
                style={{
                  position: "absolute",
                  inset: "-100%",
                  width: "300%",
                  height: "300%",
                  background:
                    "conic-gradient(from -90deg, #ff6ec4 0%, #c084fc 22%, #7c3aed 45%, #818cf8 62%, #38bdf8 78%, #c084fc 92%, #ff6ec4 100%)",
                  animation: "promptGlowSpin 8s linear infinite",
                }}
              />
              {/* Layer 2: White comet — flows around the rim on top */}
              <div
                style={{
                  position: "absolute",
                  inset: "-100%",
                  width: "300%",
                  height: "300%",
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, transparent 338deg, rgba(255,255,255,0.0) 344deg, rgba(255,255,255,1) 352deg, rgba(255,255,255,0.0) 358deg, transparent 360deg)",
                  animation: "promptGlowSpin 2.5s linear infinite",
                }}
              />
              <div
                className="relative rounded-2xl px-5 pt-5 pb-4"
                style={{
                  position: "relative",
                  zIndex: 1,
                  background: "#1c1c20",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.65)",
                }}
              >
                {/* Textarea */}
                <div className="relative" style={{ minHeight: "48px" }}>
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={handleKey}
                    className="w-full bg-transparent text-white resize-none focus:outline-none"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "1rem",
                      lineHeight: "1.65",
                      caretColor: "#c084fc",
                    }}
                  />
                  {!prompt && (
                    <div
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "1rem",
                        color: "rgba(255,255,255,0.28)",
                        lineHeight: "1.65",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={promptIdx}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.32 }}
                        >
                          {BOT_PROMPTS[promptIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Bottom toolbar — Lovable style, no divider */}
                <div className="flex items-center justify-between mt-3">
                  {/* Left: + attach button */}
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150"
                    style={{ color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.07)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Right: Plan pill + Mic + Send */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      className="px-4 py-1.5 rounded-full text-[13px] font-semibold text-white"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        background: "#2563eb",
                        boxShadow: "0 2px 12px rgba(37,99,235,0.5)",
                      }}
                    >
                      Plan
                    </motion.button>

                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150"
                      style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={handleSubmit}
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
                      style={{
                        background: prompt.trim() ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.12)",
                        color: prompt.trim() ? "#0a0514" : "rgba(255,255,255,0.38)",
                        boxShadow: prompt.trim() ? "0 2px 12px rgba(255,255,255,0.18)" : "none",
                        transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Suggestion pills */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 mb-10 max-w-2xl"
          >
            {SUGGESTION_PILLS.map((pill, i) => (
              <motion.button
                key={pill.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + i * 0.06 }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => fillPrompt(pill.label)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] hover:text-white transition-colors duration-200"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "rgba(255,255,255,0.55)",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {(() => { const Icon = pill.icon; return <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} />; })()}
                <span>{pill.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* CTA buttons */}
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.35 }}
            className="relative z-10 flex flex-wrap items-center justify-center gap-5 mb-14"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>5.0</span>
            </div>
            <span className="hidden sm:block" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>1,200+ bots launched</span>
            <span className="hidden sm:block" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>No credit card required</span>
            </div>
          </motion.div>

          {/* Feature ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="relative z-10 w-full max-w-3xl"
          >
            <FeatureTicker />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            style={{ color: "rgba(255,255,255,0.25)" }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="text-[10px] tracking-[0.25em] uppercase"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Scroll
            </span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <HowItWorks />

        {/* ══════════════ TECH LOGOS ══════════════ */}
        <TechLogos />

        {/* ══════════════ FEATURES GRID ══════════════ */}
        <FeaturesGrid />

        {/* ══════════════ FOOTER ══════════════ */}
        <footer
          className="py-6 px-8 md:px-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 10 }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <span
              className="text-xs text-slate-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              © 2026 Buildable Labs. All rights reserved.
            </span>
            <div className="flex items-center gap-7">
              {[
                { label: "Docs", to: "/docs" },
                { label: "Pricing", to: "/pricing" },
                { label: "Explore", to: "/explore" },
                { label: "Privacy", to: "/privacy" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-xs text-slate-700 hover:text-slate-300 transition-colors duration-200"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
