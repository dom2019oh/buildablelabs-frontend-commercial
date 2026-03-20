import { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';
import Grainient from '@/components/Grainient';

interface DashboardLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
  onNewBot?: () => void;
}

export default function DashboardLayout({ children, noPadding }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: '#0e0d12' }}>

      {/* Animated background — fixed so it covers the full viewport behind everything */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Grainient
          color1="#3a3c42" color2="#141518" color3="#252729"
          timeSpeed={0.35} colorBalance={0} warpStrength={1}
          warpFrequency={5} warpSpeed={2} warpAmplitude={50}
          blendAngle={0} blendSoftness={0.05} rotationAmount={500}
          noiseScale={2} grainAmount={0.1} grainScale={2}
          grainAnimated={false} contrast={1.5} gamma={1} saturation={1}
          centerX={0} centerY={0} zoom={0.9}
        />
      </div>

      {/* Sidebar sits above the background */}
      <div className="relative" style={{ zIndex: 50 }}>
        <DashboardSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-44 min-w-0 min-h-screen relative" style={{ zIndex: 10 }}>
        <main className={`flex-1 overflow-y-auto${noPadding ? '' : ' p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
