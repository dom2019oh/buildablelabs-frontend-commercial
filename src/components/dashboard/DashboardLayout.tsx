import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import SoftAurora from '@/components/SoftAurora';

interface DashboardLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
  onNewBot?: () => void;
}

export default function DashboardLayout({ children, noPadding }: DashboardLayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const showBack  = location.pathname !== '/dashboard';

  return (
    <div className="min-h-screen flex" style={{ background: '#1c1c1a' }}>

      {/* Sidebar — solid, sits above everything */}
      <div className="fixed left-0 top-0 h-full" style={{ zIndex: 50 }}>
        <DashboardSidebar />
      </div>

      {/* Main content — has its own animated background */}
      <div className="flex-1 flex flex-col ml-[240px] min-w-0 min-h-screen relative" style={{ zIndex: 10 }}>
        {/* SoftAurora only covers the main area, not the sidebar */}
        <div className="fixed top-0 bottom-0 left-[240px] right-0 pointer-events-none" style={{ zIndex: 0 }}>
          <SoftAurora
            speed={0.6}
            scale={1.5}
            brightness={1}
            color1="#f7f7f7"
            color2="#e100ff"
            noiseFrequency={2.5}
            noiseAmplitude={1}
            bandHeight={0.5}
            bandSpread={1}
            octaveDecay={0.1}
            layerOffset={0}
            colorSpeed={1}
            enableMouseInteraction
            mouseInfluence={0.25}
          />
        </div>
        {showBack && (
          <div className="flex-shrink-0 px-4 pt-4" style={{ zIndex: 1, position: 'relative' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'rgb(155,152,147)', fontFamily: "'Geist','DM Sans',sans-serif", background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,193,186,0.08)'; e.currentTarget.style.color = 'rgb(220,218,214)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgb(155,152,147)'; }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </div>
        )}
        <main className={`flex-1 overflow-y-auto relative${noPadding ? '' : ' p-6'}`} style={{ zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
