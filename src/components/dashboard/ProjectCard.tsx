import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal, Trash2, Copy, ExternalLink,
  Shield, Music2, TrendingUp, Ticket, HandshakeIcon,
  CreditCard, Wrench, Sparkles, Clock, ChevronRight,
  Radio, Hammer, WifiOff, Settings,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Template metadata ─────────────────────────────────────────────────────────

const TMPL_ICON: Record<string, {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bg: string;
  banner?: string;
}> = {
  moderation: { icon: Shield,        color: '#f87171', bg: 'rgba(239,68,68,0.12)',   banner: '/templates/moderation.png' },
  music:      { icon: Music2,        color: '#a78bfa', bg: 'rgba(139,92,246,0.12)'  },
  economy:    { icon: CreditCard,    color: '#fbbf24', bg: 'rgba(245,158,11,0.12)'  },
  leveling:   { icon: TrendingUp,    color: '#34d399', bg: 'rgba(16,185,129,0.12)'  },
  ticket:     { icon: Ticket,        color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  banner: '/templates/ticket.png'     },
  welcome:    { icon: HandshakeIcon, color: '#f472b6', bg: 'rgba(236,72,153,0.12)', banner: '/templates/community.png'  },
  community:  { icon: HandshakeIcon, color: '#f472b6', bg: 'rgba(236,72,153,0.12)', banner: '/templates/community.png'  },
  utility:    { icon: Wrench,        color: '#818cf8', bg: 'rgba(99,102,241,0.12)'  },
  'ai-chat':  { icon: Sparkles,      color: '#34d399', bg: 'rgba(16,185,129,0.12)', banner: '/templates/ai-chat.png'    },
  custom:     { icon: Sparkles,      color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', banner: '/templates/custom.png'    },
};

const LANG_BADGE: Record<string, { label: string; dot: string }> = {
  python:     { label: 'Python',     dot: '#3572A5' },
  javascript: { label: 'JavaScript', dot: '#f1e05a' },
  typescript: { label: 'TypeScript', dot: '#3178c6' },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  id: string;
  name: string;
  status: 'building' | 'ready' | 'failed';
  updatedAt: string;
  template?: string;
  language?: string;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating?: boolean;
  isDeleting?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProjectCard({
  id, name, status, updatedAt, template, language,
  onDuplicate, onDelete, isDuplicating, isDeleting,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const navigate = useNavigate();

  const tmpl = TMPL_ICON[template ?? 'custom'] ?? TMPL_ICON.custom;
  const lang = LANG_BADGE[language ?? ''];
  const Icon = tmpl.icon;

  const statusConfig = {
    ready:    { icon: Radio,    color: '#22c55e', label: 'Online',   pulse: true  },
    building: { icon: Hammer,   color: '#f59e0b', label: 'Building', pulse: false },
    failed:   { icon: WifiOff,  color: '#6b7280', label: 'Offline',  pulse: false },
  }[status] ?? { icon: WifiOff, color: '#6b7280', label: 'Offline', pulse: false };

  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Link
        to={`/dashboard/project/${id}`}
        className="block group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-200 no-underline"
        style={{
          background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.35)' : 'none',
          minHeight: '160px',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Banner or accent strip */}
        {tmpl.banner ? (
          <div
            className="h-[72px] w-full flex-shrink-0 overflow-hidden"
            style={{
              backgroundImage: `url(${tmpl.banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
            }}
          >
            {/* Fade to card background at bottom */}
            <div className="w-full h-full" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(11,10,14,0.85) 100%)' }} />
          </div>
        ) : (
          <div className="h-[1.5px]" style={{ background: `linear-gradient(90deg, ${tmpl.color}60, transparent 70%)` }} />
        )}

        {/* Card body */}
        <div className="flex flex-col gap-3 p-4 flex-1">

          {/* Icon + name row */}
          <div className="flex items-start gap-3">
            {/* Bot type icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: tmpl.bg }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color: tmpl.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold leading-tight truncate" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.88)' }}>
                {name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {/* Status */}
                <span className="flex items-center gap-1 text-[11px]" style={{ color: statusConfig.color, fontFamily: "'DM Sans', sans-serif" }}>
                  {statusConfig.pulse
                    ? <span className="relative flex w-1.5 h-1.5">
                        <span className="animate-ping absolute w-full h-full rounded-full opacity-60" style={{ background: statusConfig.color }} />
                        <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: statusConfig.color }} />
                      </span>
                    : <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusConfig.color }} />
                  }
                  {statusConfig.label}
                </span>

                {/* Language badge */}
                {lang && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: lang.dot }} />
                      {lang.label}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onClick={e => e.preventDefault()}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={e => { e.preventDefault(); navigate(`/dashboard/project/${id}/settings`); }}>
                  <Settings className="w-3.5 h-3.5 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => { e.preventDefault(); onDuplicate(); }} disabled={isDuplicating}>
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  {isDuplicating ? 'Duplicating…' : 'Duplicate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={e => { e.preventDefault(); setDeleteOpen(true); }}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metrics row (placeholder — real data when backend is wired) */}
          <div
            className="grid grid-cols-2 gap-2 rounded-xl p-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Metric label="Commands today" value={status === 'ready' ? '—' : '—'} />
            <Metric label="Last updated"   value={formatDistanceToNow(new Date(updatedAt), { addSuffix: true })} />
          </div>
        </div>

        {/* Open workspace footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5 transition-all"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            color: hovered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)',
            fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif",
            background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          }}
        >
          <span>Open workspace</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </Link>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the bot and all its files. Cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onDelete(); setDeleteOpen(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] mb-0.5" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.22)' }}>{label}</p>
      <p className="text-[12px] font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.55)' }}>{value}</p>
    </div>
  );
}
