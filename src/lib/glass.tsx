/**
 * Buildable Labs — Apple Vision Pro Glass Design System
 * Single source of truth for all glass styles, animations, and backgrounds.
 */

import { CSSProperties } from 'react';
import Grainient from '@/components/Grainient';

export const F = "'Geist', sans-serif";
export const BG = '#06060b';

// ─── Ambient Background (replaces Grainient on all public pages) ──────────────
export function AmbientBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <Grainient
        color1="#0f1e3a" color2="#07080d" color3="#c4855a"
        timeSpeed={0.35} colorBalance={0} warpStrength={1} warpFrequency={5}
        warpSpeed={2} warpAmplitude={50} blendAngle={0} blendSoftness={0.05}
        rotationAmount={500} noiseScale={2} grainAmount={0.1} grainScale={2}
        grainAnimated={false} contrast={1.5} gamma={1} saturation={1}
        centerX={0} centerY={0} zoom={0.9}
      />
    </div>
  );
}

// ─── Glass button base ────────────────────────────────────────────────────────
export const G: CSSProperties = {
  fontFamily: F,
  fontWeight: 500,
  letterSpacing: '-0.015em',
  cursor: 'pointer',
  outline: 'none',
  border: '1px solid rgba(255,255,255,0.165)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  userSelect: 'none',
  position: 'relative',
  overflow: 'hidden',
  // Apple glass layers
  background: 'linear-gradient(170deg, rgba(255,255,255,0.135) 0%, rgba(255,255,255,0.065) 100%)',
  backdropFilter: 'blur(24px) saturate(190%)',
  WebkitBackdropFilter: 'blur(24px) saturate(190%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.42), inset 0 1.5px 0 rgba(255,255,255,0.21), inset 0 -1px 0 rgba(0,0,0,0.14)',
  color: 'rgba(255,255,255,0.90)',
  transition: 'background 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
};

// ─── Glass card / panel ───────────────────────────────────────────────────────
export const GCard: CSSProperties = {
  background: 'linear-gradient(170deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)',
  backdropFilter: 'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.08)',
  borderRadius: '20px',
};

// ─── Glass input field ────────────────────────────────────────────────────────
export const GInput: CSSProperties = {
  fontFamily: F,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.18), inset 0 0 0 0 rgba(255,255,255,0.06)',
  borderRadius: '10px',
  padding: '11px 14px',
  color: 'rgba(255,255,255,0.88)',
  outline: 'none',
  transition: 'border-color 0.16s ease, box-shadow 0.16s ease',
  width: '100%',
  fontSize: '14px',
};

// ─── Glass nav bar (scrolled state) ──────────────────────────────────────────
export const GNav: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(10,5,22,0.78) 0%, rgba(6,4,14,0.68) 100%)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.28)',
};

// ─── Hover / leave for neutral glass buttons ──────────────────────────────────
export const onGE = (e: React.MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  el.style.background = 'linear-gradient(170deg, rgba(255,255,255,0.200) 0%, rgba(255,255,255,0.100) 100%)';
  el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.52), inset 0 1.5px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.16)';
};
export const onGL = (e: React.MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  el.style.background = 'linear-gradient(170deg, rgba(255,255,255,0.135) 0%, rgba(255,255,255,0.065) 100%)';
  el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.42), inset 0 1.5px 0 rgba(255,255,255,0.21), inset 0 -1px 0 rgba(0,0,0,0.14)';
};

// ─── Tinted glass ─────────────────────────────────────────────────────────────
export const tint = (r: number, g: number, b: number): CSSProperties => ({
  ...G,
  background: `linear-gradient(170deg, rgba(${r},${g},${b},0.22) 0%, rgba(${r},${g},${b},0.09) 100%)`,
  border: `1px solid rgba(${r},${g},${b},0.30)`,
  boxShadow: `0 4px 20px rgba(0,0,0,0.42), 0 0 20px rgba(${r},${g},${b},0.10), inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.12)`,
});

export const onTE = (r: number, g: number, b: number) => (e: React.MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  el.style.background = `linear-gradient(170deg, rgba(${r},${g},${b},0.32) 0%, rgba(${r},${g},${b},0.16) 100%)`;
  el.style.boxShadow = `0 8px 28px rgba(0,0,0,0.52), 0 0 28px rgba(${r},${g},${b},0.22), inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.14)`;
};
export const onTL = (r: number, g: number, b: number) => (e: React.MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  el.style.background = `linear-gradient(170deg, rgba(${r},${g},${b},0.22) 0%, rgba(${r},${g},${b},0.09) 100%)`;
  el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.42), 0 0 20px rgba(${r},${g},${b},0.10), inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.12)`;
};

// ─── Framer Motion animation presets ─────────────────────────────────────────
// Apple-style spring physics — snappy, natural, no over-bounce
export const spring = {
  // Page / section entry
  enter:  { type: 'spring', stiffness: 280, damping: 28 } as const,
  // Button press / release
  button: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const },
  // Large panel slide
  panel:  { type: 'spring', stiffness: 200, damping: 25 } as const,
  // Simple fade
  fade:   { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  // Fast micro-interaction
  micro:  { duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] as const },
} as const;

// Reusable whileHover / whileTap for glass buttons
export const BH  = { y: -1.5, scale: 1.01 } as const;  // button hover
export const BT  = { y: 1,    scale: 0.97 } as const;  // button tap
export const BTR = spring.button;                        // button transition
