import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Layers, BarChart2,
  Settings, LogOut, ChevronDown, PanelLeft,
  Plus, Bot, Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoSvg from '@/assets/logo.svg';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV = [
  { icon: LayoutDashboard, label: 'Fleet',      href: '/dashboard'          },
  { icon: Activity,        label: 'Activity',   href: '#'                   },
  { icon: Layers,          label: 'Templates',  href: '/dashboard/templates'},
  { icon: BarChart2,       label: 'Usage',      href: '/dashboard/usage'    },
  { icon: Settings,        label: 'Settings',   href: '/dashboard/settings' },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { projects } = useProjects();

  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarUrl   = profile?.avatarUrl || user?.photoURL;
  const initials    = displayName.slice(0, 2).toUpperCase();

  const onlineBots   = projects.filter(p => p.status === 'ready').length;
  const buildingBots = projects.filter(p => p.status === 'building').length;
  // Free plan = 50 credits; no real data yet
  const creditsUsed  = 0;
  const creditsTotal = 50;

  const isActive = (href: string) =>
    href === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(href);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[176px] flex flex-col z-50"
      style={{
        background: 'rgba(11,10,15,0.94)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(32px)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center justify-between pl-4 pr-3 h-12 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link to="/dashboard" className="flex items-center gap-2.5 opacity-85 hover:opacity-100 transition-opacity">
          <img src={logoSvg} alt="Buildable" className="w-[17px] h-[17px]" draggable={false} />
          <span className="text-[12.5px] font-semibold tracking-wide" style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.72)' }}>
            Buildable
          </span>
        </Link>
        <button
          className="p-1 rounded transition-colors"
          style={{ color: 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
        >
          <PanelLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── User dropdown ── */}
      <div className="px-2 pt-2 pb-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-colors text-left group"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar className="h-[22px] w-[22px] flex-shrink-0">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-[9px] font-bold" style={{ background: 'rgba(80,80,100,0.8)', color: 'rgba(255,255,255,0.8)' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[12.5px] font-medium truncate flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{displayName}</span>
              <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.22)' }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 border-white/[0.09]" style={{ background: '#13121a', boxShadow: '0 8px 32px rgba(0,0,0,0.65)' }}>
            <div className="px-3 py-2.5">
              <p className="text-[13px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.82)' }}>{displayName}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="text-white/60 focus:text-white/90 focus:bg-white/[0.07] cursor-pointer text-[13px]">Profile &amp; Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/billing')} className="text-white/60 focus:text-white/90 focus:bg-white/[0.07] cursor-pointer text-[13px]">Plans &amp; Credits</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-400/80 focus:text-red-300 focus:bg-red-500/10 cursor-pointer text-[13px]">
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── New Bot CTA ── */}
      <div className="px-2 pb-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.11)',
            color: 'rgba(255,255,255,0.72)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = 'rgba(255,255,255,0.92)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; }}
        >
          <Plus className="w-3.5 h-3.5" /> New Bot
        </button>
      </div>

      {/* ── Status summary ── */}
      {projects.length > 0 && (
        <div
          className="mx-2 mb-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Sans', sans-serif" }}>Fleet status</p>
          <div className="flex flex-col gap-1.5">
            <StatusRow dot="#22c55e" label="Online" count={onlineBots} />
            <StatusRow dot="#f59e0b" label="Building" count={buildingBots} />
            <StatusRow dot="#6b7280" label="Offline" count={projects.length - onlineBots - buildingBots} />
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5 overflow-y-auto pb-2">
        {NAV.map(({ icon: Icon, label, href }) => {
          const active = isActive(href);
          return (
            href === '#'
              ? (
                <button key={label} className="w-full text-left">
                  <NavRow Icon={Icon} label={label} active={active} />
                </button>
              ) : (
                <Link key={label} to={href} className="block">
                  <NavRow Icon={Icon} label={label} active={active} />
                </Link>
              )
          );
        })}
      </nav>

      {/* ── Credits & upgrade ── */}
      <div
        className="px-2 pb-3 pt-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Credits bar */}
        <div className="px-2 py-2 mb-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px]" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.38)' }}>
              Credits
            </span>
            <span className="text-[10.5px] font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
              {creditsTotal - creditsUsed}/{creditsTotal}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((creditsTotal - creditsUsed) / creditsTotal) * 100}%`,
                background: creditsUsed > creditsTotal * 0.8
                  ? 'rgba(239,68,68,0.7)'
                  : 'rgba(255,255,255,0.35)',
              }}
            />
          </div>
        </div>

        {/* Upgrade */}
        <button
          onClick={() => navigate('/dashboard/billing')}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <div>
            <p className="text-[11.5px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>Upgrade to Pro</p>
            <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.22)' }}>500 credits · 10 bots</p>
          </div>
        </button>
      </div>
    </aside>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function NavRow({ Icon, label, active }: { Icon: React.ComponentType<{ className?: string }>; label: string; active: boolean }) {
  return (
    <span
      className="flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors w-full"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.38)',
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        boxShadow: active ? 'inset 2px 0 0 rgba(255,255,255,0.4)' : 'none',
      }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </span>
  );
}

function StatusRow({ dot, label, count }: { dot: string; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
        <span className="text-[11px]" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.38)' }}>{label}</span>
      </div>
      <span className="text-[11px] font-medium tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>{count}</span>
    </div>
  );
}
