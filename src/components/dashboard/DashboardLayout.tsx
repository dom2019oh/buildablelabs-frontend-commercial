import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, PanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';

const SIDEBAR_W = 280;
const FONT = "'Geist', 'DM Sans', sans-serif";

interface DashboardLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
  onNewBot?: () => void;
}

export default function DashboardLayout({ children, noPadding }: DashboardLayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const showBack  = location.pathname !== '/dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex" style={{ background: '#0c0c0c', overflow: 'hidden' }}>

      {/* ── Sidebar — slides left when collapsed ── */}
      <motion.div
        animate={{ x: sidebarOpen ? 0 : -SIDEBAR_W }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 50, width: SIDEBAR_W }}
      >
        <DashboardSidebar onToggle={() => setSidebarOpen(false)} />
      </motion.div>

      {/* ── Re-open button — floats at top-left when sidebar is hidden ── */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            key="reopen-btn"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
            style={{
              position: 'fixed', left: 12, top: 14, zIndex: 60,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgb(155,152,147)', cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              fontFamily: FONT,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgb(220,218,214)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgb(155,152,147)'; }}
          >
            <PanelLeft style={{ width: 15, height: 15 }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Main content — expands when sidebar collapses ── */}
      <motion.div
        animate={{ marginLeft: sidebarOpen ? SIDEBAR_W : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-w-0 min-h-screen relative"
        style={{ zIndex: 10 }}
      >
        {showBack && (
          <div className="flex-shrink-0 px-4 pt-4" style={{ zIndex: 1, position: 'relative' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'rgb(155,152,147)', fontFamily: FONT, background: 'transparent', marginLeft: !sidebarOpen ? 36 : 0, transition: 'margin-left 0.3s' }}
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
      </motion.div>
    </div>
  );
}
