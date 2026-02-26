/**
 * CardNav — adapted from ReactBits (https://reactbits.dev/components/card-nav)
 * Original by DavidHDev · Adapted for Buildable Labs (dark theme, lucide icons, auth-aware)
 */
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import wordmarkSvg from "@/assets/buildable-wordmark.svg";

// ─── Types ────────────────────────────────────────────────────────────────────
type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

// ─── Default nav items ────────────────────────────────────────────────────────
export const DEFAULT_NAV_ITEMS: CardNavItem[] = [
  {
    label: "Solutions",
    bgColor: "#130a26",
    textColor: "rgba(196,181,253,0.92)",
    links: [
      { label: "Bot Builder",   href: "/",        ariaLabel: "AI Discord Bot Builder" },
      { label: "Templates",     href: "/explore", ariaLabel: "Browse bot templates" },
      { label: "Pro Hosting",   href: "/pricing", ariaLabel: "Bot hosting plans" },
      { label: "Multi-Bot",     href: "/pricing", ariaLabel: "Manage multiple bots" },
    ],
  },
  {
    label: "Resources",
    bgColor: "#0b1e17",
    textColor: "rgba(110,231,183,0.92)",
    links: [
      { label: "Documentation", href: "/docs",    ariaLabel: "Buildable Labs documentation" },
      { label: "Tutorials",     href: "/docs",    ariaLabel: "Step-by-step guides" },
      { label: "API Reference", href: "/docs",    ariaLabel: "Developer API reference" },
      { label: "Community",     href: "/explore", ariaLabel: "Join the community" },
    ],
  },
  {
    label: "About Us",
    bgColor: "#0c1228",
    textColor: "rgba(165,180,252,0.92)",
    links: [
      { label: "Our Story",  href: "/",       ariaLabel: "The Buildable Labs story" },
      { label: "Blog",       href: "/docs",   ariaLabel: "Latest updates and insights" },
      { label: "Changelog",  href: "/docs",   ariaLabel: "What's new" },
      { label: "Contact",    href: "/",       ariaLabel: "Get in touch" },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface CardNavProps {
  items?: CardNavItem[];
  ease?: string;
}

export default function CardNav({
  items = DEFAULT_NAV_ITEMS,
  ease = "power3.out",
}: CardNavProps) {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  // ── Height calculation ──
  const getHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const content = navEl.querySelector(".cnav-content") as HTMLElement;
      if (content) {
        const prev = { vis: content.style.visibility, pe: content.style.pointerEvents, pos: content.style.position, h: content.style.height };
        content.style.visibility = "visible";
        content.style.pointerEvents = "auto";
        content.style.position = "static";
        content.style.height = "auto";
        content.offsetHeight;
        const height = 60 + content.scrollHeight + 16;
        content.style.visibility = prev.vis;
        content.style.pointerEvents = prev.pe;
        content.style.position = prev.pos;
        content.style.height = prev.h;
        return height;
      }
    }
    return 260;
  };

  // ── Timeline factory ──
  const buildTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: getHeight, duration: 0.4, ease });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1");
    return tl;
  };

  useLayoutEffect(() => {
    const tl = buildTimeline();
    tlRef.current = tl;
    return () => { tl?.kill(); tlRef.current = null; };
  }, [ease, items]);

  useLayoutEffect(() => {
    const onResize = () => {
      if (!tlRef.current) return;
      if (expanded) {
        gsap.set(navRef.current, { height: getHeight() });
        tlRef.current.kill();
        const tl = buildTimeline();
        if (tl) { tl.progress(1); tlRef.current = tl; }
      } else {
        tlRef.current.kill();
        const tl = buildTimeline();
        if (tl) tlRef.current = tl;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [expanded]);

  // ── Toggle ──
  const toggle = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!expanded) {
      setHamburgerOpen(true);
      setExpanded(true);
      tl.play(0);
    } else {
      setHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setExpanded(false));
      tl.reverse();
    }
  };

  const setCard = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-[92%] max-w-[860px] z-50 top-[1.2em] md:top-[1.6em]">
      <nav
        ref={navRef}
        className="block h-[60px] p-0 rounded-xl relative overflow-hidden will-change-[height]"
        style={{
          background: "rgba(8, 4, 20, 0.88)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* ── Top bar ── */}
        <div className="absolute inset-x-0 top-0 h-[60px] flex items-center justify-between px-4 z-[2]">

          {/* Hamburger */}
          <button
            onClick={toggle}
            aria-label={expanded ? "Close menu" : "Open menu"}
            className="group flex flex-col items-center justify-center gap-[6px] h-full cursor-pointer order-2 md:order-none px-1"
          >
            <span
              className="block w-[22px] h-[1.5px] bg-white/60 transition-all duration-300 origin-center"
              style={{ transform: hamburgerOpen ? "translateY(3.75px) rotate(45deg)" : "none", opacity: hamburgerOpen ? 1 : 0.6 }}
            />
            <span
              className="block w-[22px] h-[1.5px] bg-white/60 transition-all duration-300 origin-center"
              style={{ transform: hamburgerOpen ? "translateY(-3.75px) rotate(-45deg)" : "none", opacity: hamburgerOpen ? 1 : 0.6 }}
            />
          </button>

          {/* Logo — centered on mobile, left-of-center on desktop */}
          <Link
            to="/"
            className="flex items-center gap-2.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 order-1 md:order-none"
          >
            <img
              src={wordmarkSvg}
              alt="Buildable Labs"
              className="object-contain select-none"
              style={{ height: "30px", width: "auto" }}
              draggable={false}
            />
          </Link>

          {/* Right: auth-aware CTA */}
          <div className="flex items-center gap-3 order-3 md:order-none">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-8 w-8 border border-white/10 hover:border-white/25 transition-colors">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-purple-900/40 text-purple-200 text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-popover border border-border shadow-lg z-[100]" sideOffset={8}>
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={async () => { await signOut(); navigate("/"); }}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/sign-up"
                className="hidden md:inline-flex items-center h-[36px] rounded-[calc(0.75rem-0.2rem)] px-4 text-sm font-medium text-white transition-colors duration-200"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: "rgba(109,40,217,0.35)",
                  border: "1px solid rgba(167,139,250,0.25)",
                }}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* ── Card grid ── */}
        <div
          className={`cnav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col gap-2 items-stretch z-[1] md:flex-row md:gap-3 md:items-end ${
            expanded ? "visible pointer-events-auto" : "invisible pointer-events-none"
          }`}
          aria-hidden={!expanded}
        >
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              ref={setCard(idx)}
              className="relative flex flex-col gap-2 rounded-[calc(0.75rem-0.2rem)] p-3 md:p-4 min-h-[60px] md:h-full flex-1 select-none"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              {/* Category label */}
              <p
                className="font-normal tracking-[-0.3px] text-[17px] md:text-[20px]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {item.label}
              </p>

              {/* Links */}
              <div className="mt-auto flex flex-col gap-[3px]">
                {item.links.map((lnk, i) => (
                  <Link
                    key={`${lnk.label}-${i}`}
                    to={lnk.href}
                    aria-label={lnk.ariaLabel}
                    className="inline-flex items-center gap-[5px] no-underline transition-opacity duration-200 hover:opacity-60 text-[13px] md:text-[14px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
                    onClick={() => toggle()}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    {lnk.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
