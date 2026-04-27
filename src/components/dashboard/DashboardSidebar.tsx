import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, Search, Compass, Settings, Share2, Zap, Inbox, Coins, BarChart2, PanelLeft } from 'lucide-react';
import SearchModal from './SearchModal';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useCredits } from '@/hooks/useCredits';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoStack from '/logo-stack-white.svg';

const FONT = "'Geist', 'DM Sans', sans-serif";
const C_ACTIVE  = 'rgb(255, 255, 255)';
const C_MUTED   = 'rgb(220, 218, 214)';
const C_DIM     = 'rgb(155, 152, 147)';
const BG_ACTIVE = 'rgba(197,193,186,0.10)';
const BORDER    = '1px solid rgb(39, 39, 37)';

export default function DashboardSidebar({ onToggle }: { onToggle?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { projects } = useProjects();

  const recents     = projects.slice(0, 5);
  const [searchOpen, setSearchOpen] = useState(false);
  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarUrl   = profile?.avatarUrl || user?.photoURL;
  const initials    = displayName.slice(0, 2).toUpperCase();

  const hasNewMessages = false; // TODO: wire to Firestore notifications collection

  const { credits, totalCredits, currentPlanType } = useCredits();
  const isFree = currentPlanType === 'free';
  const lifetimeLimit = credits?.free_lifetime_limit ?? 10;
  const lifetimeUsed  = credits?.lifetime_builds_used ?? 0;
  const lifetimeLeft  = Math.max(0, lifetimeLimit - lifetimeUsed);

  const isActive = (href: string) =>
    href === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(href);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-50"
      style={{ width: '280px', background: '#0c0c0c' }}
    >
      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0 flex items-center justify-between">
        <img src={logoStack} alt="Buildable" className="h-6 w-auto object-contain" />
        <button
          onClick={onToggle}
          title="Collapse sidebar"
          style={{ color: C_DIM, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = C_MUTED; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_DIM; }}
        >
          <PanelLeft style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* ── Main nav ──────────────────────────────────────────────── */}
      <div className="px-2 pt-3 pb-1">
        <NavItem icon={Home}    label="Home"    href="/"                       active={false} />
        <SearchNavItem onOpen={() => setSearchOpen(true)} active={false} />
        <NavItem icon={Compass}   label="Explore"  href="/dashboard/explore"         active={isActive('/dashboard/explore')} />
        <NavItem icon={BarChart2} label="Costs"    href="/dashboard/costs"            active={isActive('/dashboard/costs')} />
        <NavItem icon={Settings}  label="Settings" href="/dashboard/settings"         active={isActive('/dashboard/settings')} />
      </div>

      {/* ── Projects section ──────────────────────────────────────── */}
      <SectionLabel label="Projects" />
      <div className="px-2 pb-1">
        <TextNavItem label="All bots"      href="/dashboard" />
        <TextNavItem label="Templates"      href="/dashboard/templates" />
        <TextNavItem label="Starred"        href="#" />
        <TextNavItem label="Created by me"  href="#" />
        <TextNavItem label="Shared with me" href="#" />
      </div>

      {/* ── Recents section ───────────────────────────────────────── */}
      {recents.length > 0 && (
        <>
          <SectionLabel label="Recents" />
          <div className="px-2 pb-2">
            {recents.map(p => (
              <Link
                key={p.id}
                to={`/dashboard/project/${p.id}`}
                className="block px-4 py-[6px] rounded-lg text-[12.5px] truncate transition-all"
                style={{ color: C_MUTED, fontFamily: FONT }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = C_ACTIVE; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_MUTED; }}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* ── Credit pill ───────────────────────────────────────────── */}
      <div className="px-3 pb-2">
        <button
          onClick={() => navigate('/dashboard/settings?tab=billing')}
          className="flex items-center gap-2 w-full px-3 py-[7px] rounded-lg text-[12px] transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: C_DIM, fontFamily: FONT }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = C_MUTED; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C_DIM; }}
        >
          <Coins className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isFree && lifetimeLeft <= 2 ? '#f87171' : isFree && lifetimeLeft <= 5 ? '#fbbf24' : '#a78bfa' }} />
          {isFree ? (
            <span className="flex-1 text-left">{lifetimeLeft} of {lifetimeLimit} lifetime</span>
          ) : (
            <span className="flex-1 text-left">{totalCredits} credit{totalCredits !== 1 ? 's' : ''}</span>
          )}
          {isFree && lifetimeLeft === 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
              0 left
            </span>
          )}
        </button>
      </div>

      {/* ── Share + Upgrade ───────────────────────────────────────── */}
      <div className="px-2 pt-2 pb-2">
        {/* Share */}
        <button
          className="flex items-center gap-2 w-full px-3 py-[7px] rounded-lg text-[12.5px] mb-1 transition-all"
          style={{ color: C_MUTED, fontFamily: FONT }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = C_ACTIVE; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_MUTED; }}
        >
          <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Share Buildable</span>
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', color: C_DIM }}
          >
            +50 cr
          </span>
        </button>

        {/* Upgrade */}
        <button
          onClick={() => navigate('/dashboard/settings?tab=billing')}
          className="w-full flex items-center gap-2 px-3 py-[7.5px] rounded-lg text-[12.5px] font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: C_ACTIVE,
            fontFamily: FONT,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
        >
          <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
          <div className="flex-1 text-left">
            <p className="text-[12.5px] font-medium leading-tight" style={{ color: C_ACTIVE }}>Upgrade to Pro</p>
            <p className="text-[10.5px] leading-tight" style={{ color: C_DIM }}>Unlock more features</p>
          </div>
        </button>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Bottom row: Avatar + Inbox ─────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
        style={{ borderTop: 'none' }}
      >
        {/* Avatar — click opens settings */}
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="flex items-center gap-2 rounded-lg p-1 transition-all"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,193,186,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatarUrl || undefined} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            <AvatarFallback
              className="text-[10px] font-semibold"
              style={{ background: 'rgba(80,80,100,0.9)', color: C_ACTIVE }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[12.5px] truncate max-w-[110px]" style={{ color: C_MUTED, fontFamily: FONT }}>
            {displayName}
          </span>
        </button>

        {/* Inbox icon */}
        <button
          className="relative p-1.5 rounded-lg transition-all"
          style={{ color: C_DIM }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = C_MUTED; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_DIM; }}
        >
          <Inbox className="w-4 h-4" />
          {hasNewMessages && (
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: '#ef4444', boxShadow: '0 0 4px rgba(239,68,68,0.8)' }}
            />
          )}
        </button>
      </div>
    </aside>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function NavItem({
  icon: Icon, label, href, active, shortcut,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active: boolean;
  shortcut?: string;
}) {
  const cls = `flex items-center justify-start gap-2.5 px-3 py-[7px] rounded-lg text-[13px] w-full text-left transition-all`;
  const baseStyle: React.CSSProperties = {
    fontFamily: FONT,
    color: active ? C_ACTIVE : C_MUTED,
    background: active ? BG_ACTIVE : 'transparent',
  };

  const enter = !active
    ? (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.background = 'rgba(197,193,186,0.08)';
        e.currentTarget.style.color = 'rgb(252,251,248)';
      }
    : undefined;
  const leave = !active
    ? (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = C_MUTED;
      }
    : undefined;

  const inner = (
    <>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.07)', color: C_DIM }}
        >
          {shortcut}
        </span>
      )}
    </>
  );

  if (href === '#') {
    return (
      <button className={cls} style={baseStyle} onMouseEnter={enter} onMouseLeave={leave}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={href} className={cls} style={baseStyle} onMouseEnter={enter} onMouseLeave={leave}>
      {inner}
    </Link>
  );
}

function TextNavItem({ label, href }: { label: string; href: string }) {
  if (href === '#') {
    return (
      <button
        className="block w-full text-left px-4 py-[6px] rounded-lg text-[12.5px] transition-all"
        style={{ color: C_MUTED, fontFamily: FONT }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = C_ACTIVE; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_MUTED; }}
      >
        {label}
      </button>
    );
  }
  return (
    <Link
      to={href}
      className="block px-4 py-[6px] rounded-lg text-[12.5px] transition-all"
      style={{ color: C_MUTED, fontFamily: FONT }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = C_ACTIVE; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_MUTED; }}
    >
      {label}
    </Link>
  );
}

function SearchNavItem({ onOpen, active }: { onOpen: () => void; active: boolean }) {
  const cls = `flex items-center justify-start gap-2.5 px-3 py-[7px] rounded-lg text-[13px] w-full text-left transition-all`;
  return (
    <button
      className={cls}
      style={{ fontFamily: FONT, color: C_MUTED, background: 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = 'rgb(252,251,248)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_MUTED; }}
      onClick={onOpen}
    >
      <Search className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 truncate">Search</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: C_DIM }}>⌘K</span>
    </button>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="text-[10px] uppercase tracking-widest px-4 pb-1 pt-3"
      style={{ color: C_DIM, fontFamily: FONT }}
    >
      {label}
    </p>
  );
}
