import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Compass, CreditCard, Settings, FileText, Users, Zap } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

const FONT = "'Geist', 'DM Sans', sans-serif";
const BORDER = '1px solid rgb(39,39,37)';

const STATIC_ROUTES = [
  { icon: Home,      label: 'Home',             sub: 'Dashboard home',         href: '/dashboard' },
  { icon: Compass,   label: 'Explore',          sub: 'Discover & Templates',   href: '/dashboard/explore' },
  { icon: Zap,       label: 'Upgrade to Pro',   sub: 'Plans & billing',        href: '/dashboard/settings?tab=billing' },
  { icon: Settings,  label: 'Settings',         sub: 'Profile & preferences',  href: '/dashboard/settings' },
  { icon: FileText,  label: 'Templates',        sub: 'Browse bot templates',   href: '/dashboard/templates' },
  { icon: CreditCard,label: 'Billing',          sub: 'Credits & subscription', href: '/dashboard/settings?tab=billing' },
  { icon: Users,     label: 'Community',        sub: 'Community hub',          href: '/community' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const { projects } = useProjects();
  const inputRef = useRef<HTMLInputElement>(null);

  const projectRoutes = projects.map(p => ({
    icon: FileText,
    label: p.name,
    sub: 'Project',
    href: `/dashboard/project/${p.id}`,
  }));

  const all = [...STATIC_ROUTES, ...projectRoutes];
  const filtered = query.trim()
    ? all.filter(r => r.label.toLowerCase().includes(query.toLowerCase()) || r.sub.toLowerCase().includes(query.toLowerCase()))
    : all;

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) { navigate(filtered[selected].href); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selected, filtered, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[18vh]"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden"
        style={{ background: '#0c0c0c', border: BORDER, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: BORDER }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(120,116,110)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, projects…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}
          />
          <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'rgb(30,30,30)', color: 'rgb(120,116,110)', fontFamily: FONT }}>ESC</span>
        </div>

        {/* Results */}
        <div className="py-1.5 max-h-[360px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>No results</p>
          ) : (
            filtered.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.href + i}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all"
                  style={{
                    background: selected === i ? 'rgba(197,193,186,0.08)' : 'transparent',
                    fontFamily: FONT,
                  }}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => { navigate(r.href); onClose(); }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(24,24,24)', border: BORDER }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: 'rgb(197,193,186)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] truncate" style={{ color: 'rgb(252,251,248)' }}>{r.label}</p>
                    <p className="text-[11px] truncate" style={{ color: 'rgb(120,116,110)' }}>{r.sub}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: BORDER }}>
          {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgb(24,24,24)', color: 'rgb(120,116,110)', border: BORDER }}>{key}</span>
              <span className="text-[11px]" style={{ color: 'rgb(80,78,76)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
