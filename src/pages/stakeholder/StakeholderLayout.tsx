import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenLine, Coins, Bell, BarChart2, ExternalLink, LogOut } from 'lucide-react';
import wordmarkSvg from '@/assets/buildable-wordmark.svg';

const nav = [
  { path: '/stakeholder',            label: 'Overview',  icon: LayoutDashboard },
  { path: '/stakeholder/analytics',  label: 'Analytics', icon: BarChart2 },
  { path: '/stakeholder/blog',       label: 'Blog',      icon: PenLine },
  { path: '/stakeholder/credits',    label: 'Credits',   icon: Coins },
  { path: '/stakeholder/notify',     label: 'Notify',    icon: Bell },
];

export default function StakeholderLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('stakeholder_auth');
    navigate('/stakeholder');
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07080d', fontFamily: "'Geist', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: '212px', flexShrink: 0,
        background: 'rgba(255,255,255,0.025)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 20,
      }}>
        {/* Logo + badge */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
            <img src="/logo-stack-white.svg" alt="" aria-hidden draggable={false} style={{ height: '17px', opacity: 0.8 }} />
            <img src={wordmarkSvg} alt="Buildable Labs" draggable={false} style={{ height: '19px', opacity: 0.8 }} />
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)',
            borderRadius: '999px', padding: '2px 10px',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
            color: 'rgba(251,191,36,0.8)', textTransform: 'uppercase' as const,
          }}>
            Founder
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
                  background: active ? 'rgba(217,119,6,0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(217,119,6,0.20)' : 'transparent'}`,
                  color: active ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.45)',
                  fontSize: '13px', fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
              color: 'rgba(255,255,255,0.3)', fontSize: '12px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            <ExternalLink style={{ width: '13px', height: '13px' }} />
            Public site
          </a>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px', background: 'none',
              border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'left' as const,
              transition: 'color 0.15s', width: '100%',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            <LogOut style={{ width: '13px', height: '13px' }} />
            Lock dashboard
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '212px', flex: 1, minHeight: '100vh', padding: '36px 40px' }}>
        {children}
      </main>
    </div>
  );
}
