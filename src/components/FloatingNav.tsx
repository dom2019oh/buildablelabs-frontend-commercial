import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Bot, LayoutGrid, Cloud, Layers, BarChart2,
  BookOpen, GraduationCap, Users, History,
  Heart, FileText, Briefcase, Mail, Gift,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import wordmarkSvg from "@/assets/buildable-wordmark.svg";
import { getLoginUrl, getDashboardUrl } from "@/lib/urls";
import { G, onGE, onGL, BH, BT, BTR, GNav } from "@/lib/glass";

// ─── Nav data (used by footer in Index.tsx) ───────────────────────────────────

type DropItem = { label: string; href: string; icon: React.ElementType<{ className?: string }> };
type NavEntry = { label: string; items: DropItem[] };

export const NAV_ENTRIES: NavEntry[] = [
  {
    label: "Solutions",
    items: [
      { label: "Bot Builder",  href: "/bot-builder", icon: Bot },
      { label: "Templates",    href: "/explore",     icon: LayoutGrid },
      { label: "Pro Hosting",  href: "/pro-hosting",  icon: Cloud },
      { label: "Multi-Bot",    href: "/pricing",     icon: Layers },
      { label: "Analytics",    href: "/dashboard",   icon: BarChart2 },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Documentation", href: "/docs",       icon: BookOpen },
      { label: "Tutorials",     href: "/tutorials",  icon: GraduationCap },
      { label: "Community",     href: "/community",  icon: Users },
      { label: "Changelog",     href: "/changelog",  icon: History },
    ],
  },
  {
    label: "About",
    items: [
      { label: "Our Story", href: "/about",    icon: Heart },
      { label: "Blog",      href: "/blog",     icon: FileText },
      { label: "Careers",   href: "/careers",  icon: Briefcase },
      { label: "Contact",   href: "/contact",  icon: Mail },
      { label: "Donate",    href: "/donate",   icon: Gift },
    ],
  },
];

// ─── Dropdown item ─────────────────────────────────────────────────────────────

function DropPanel({ entry, onClose }: { entry: NavEntry; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        minWidth: "200px",
        background: "rgba(8, 6, 18, 0.62)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "14px",
        padding: "8px",
        boxShadow: "0 20px 56px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.06) inset",
        zIndex: 100,
      }}
    >
      {/* subtle top shine */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "14px",
          background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />
      {entry.items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            to={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-[9px] rounded-[10px] group transition-all duration-150"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.10)",
                flexShrink: 0,
              }}
            >
              <Icon className="w-[13px] h-[13px]" style={{ color: "rgba(255,255,255,0.65)" }} />
            </span>
            <span
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.75)",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </motion.div>
  );
}

// ─── Dropdown trigger ──────────────────────────────────────────────────────────

function DropNav({ entry }: { entry: NavEntry }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-200 hover:bg-white/[0.06]"
        style={{
          fontFamily: "'Geist', 'DM Sans', sans-serif",
          fontWeight: 400,
          color: "rgba(255,255,255,0.78)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        {entry.label}
        <ChevronDown
          className="w-[13px] h-[13px] transition-transform duration-200"
          style={{
            color: "rgba(255,255,255,0.45)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <DropPanel
            entry={entry}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Floating Nav ─────────────────────────────────────────────────────────────

interface FloatingNavProps {
  hidePricing?: boolean;
}

export default function FloatingNav({ hidePricing }: FloatingNavProps) {
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
        ...(scrolled ? GNav : {}),
        background: scrolled
          ? GNav.background as string
          : "transparent",
        backdropFilter: scrolled ? GNav.backdropFilter as string : "none",
        WebkitBackdropFilter: scrolled ? GNav.WebkitBackdropFilter as string : "none",
        borderBottom: scrolled ? GNav.borderBottom as string : "1px solid transparent",
        boxShadow: scrolled ? GNav.boxShadow as string : "none",
        transition: "background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      {/* LEFT: Logo + wordmark */}
      <Link to="/" className="flex items-center gap-[10px] flex-shrink-0 mr-8">
        <img src="/logo-stack-white.svg" alt="" aria-hidden draggable={false} className="select-none block" style={{ height: "22px", width: "auto", objectFit: "contain", flexShrink: 0 }} />
        <img src={wordmarkSvg} alt="Buildable Labs" draggable={false} className="select-none block" style={{ height: "30px", width: "auto", objectFit: "contain" }} />
      </Link>

      {/* CENTER: dropdown nav links */}
      <div className="hidden md:flex items-center gap-0.5 flex-1">
        {NAV_ENTRIES.map((entry) => (
          <DropNav key={entry.label} entry={entry} />
        ))}
        {!hidePricing && (
          <Link
            to="/pricing"
            className="px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-200 hover:bg-white/[0.06]"
            style={{
              fontFamily: "'Geist', 'DM Sans', sans-serif",
              fontWeight: 400,
              color: "rgba(255,255,255,0.78)",
            }}
          >
            Pricing
          </Link>
        )}
      </div>

      {/* RIGHT: CTA */}
      <div className="ml-auto flex items-center gap-4 flex-shrink-0">
        {user ? (
          <Link
            to="/dashboard"
            className="text-[13px] font-medium text-white/70 hover:text-white transition-colors"
            style={{ fontFamily: "'Geist', 'DM Sans', sans-serif" }}
          >
            Dashboard →
          </Link>
        ) : (
          <>
            <a
              href={getLoginUrl()}
              className="hidden sm:block text-[13px] text-white/60 hover:text-white transition-colors"
              style={{ fontFamily: "'Geist', 'DM Sans', sans-serif" }}
            >
              Log in
            </a>
            <motion.a
              href={getDashboardUrl()}
              style={{ ...G, borderRadius: '999px', padding: '7px 16px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
              whileHover={BH}
              whileTap={BT}
              transition={BTR}
              onMouseEnter={onGE}
              onMouseLeave={onGL}
            >
              Open Dashboard
            </motion.a>
          </>
        )}
      </div>
    </motion.header>
  );
}
