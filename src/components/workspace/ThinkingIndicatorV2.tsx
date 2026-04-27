import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerationPhase } from '@/hooks/useBuildableAI';

const F = "'Geist', 'DM Sans', sans-serif";

// ─── Mini Orb ────────────────────────────────────────────────────────────────

function MiniOrb({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = 2;
    const S = 22 * DPR;
    canvas.width = S;
    canvas.height = S;

    const CX = S / 2, CY = S / 2;
    const R = S * 0.34;
    const FOV = S * 1.9;
    const N = 55;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const particles = Array.from({ length: N }, (_, i) => {
      const cosP = 1 - (2 * i) / (N - 1);
      const phi = Math.acos(Math.max(-1, Math.min(1, cosP)));
      const theta = (golden * i) % (2 * Math.PI);
      return { phi, theta };
    });

    const cosX = Math.cos(0.3), sinX = Math.sin(0.3);
    let rotY = 0, raf = 0;

    function draw() {
      ctx.clearRect(0, 0, S, S);
      rotY += activeRef.current ? 0.032 : 0.007;

      const pts = particles.map(p => {
        const sinP = Math.sin(p.phi);
        const x = R * sinP * Math.cos(p.theta + rotY);
        const y = R * Math.cos(p.phi);
        const z = R * sinP * Math.sin(p.theta + rotY);
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        const scale = FOV / (FOV + z2 + R * 0.08);
        const depth = (z2 + R) / (2 * R);
        return {
          sx: CX + x * scale,
          sy: CY + y2 * scale,
          depth,
          alpha: 0.2 + depth * 0.65,
          dotSize: 0.5 + depth * 1.1,
        };
      });

      pts.sort((a, b) => a.depth - b.depth);
      for (const { sx, sy, alpha, dotSize } of pts) {
        ctx.beginPath();
        ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(185,185,215,${alpha.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 22, height: 22, display: 'block', flexShrink: 0 }}
    />
  );
}

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS: { id: GenerationPhase['phase']; label: string }[] = [
  { id: 'context',    label: 'Reading your request' },
  { id: 'intent',     label: 'Understanding intent' },
  { id: 'planning',   label: 'Planning architecture' },
  { id: 'generating', label: 'Writing code files' },
  { id: 'validating', label: 'Validating output' },
];

const PHASE_ORDER: GenerationPhase['phase'][] = [
  'starting', 'context', 'intent', 'planning', 'generating', 'validating', 'complete',
];

function phaseIndex(p: GenerationPhase['phase']): number {
  return PHASE_ORDER.indexOf(p);
}

interface ThinkingIndicatorV2Props {
  isVisible: boolean;
  phase?: GenerationPhase;
  filesDelivered?: number;
  filePaths?: string[];
  onCancel?: () => void;
}

export default function ThinkingIndicatorV2({
  isVisible,
  phase,
  filesDelivered = 0,
  filePaths = [],
  onCancel,
}: ThinkingIndicatorV2Props) {
  const currentPhase = phase?.phase ?? 'starting';
  const currentIdx = phaseIndex(currentPhase);
  const isComplete = currentPhase === 'complete';
  const isError = currentPhase === 'error';
  const isActive = isVisible && !isComplete && !isError;

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!phase) return;
    const idx = phaseIndex(phase.phase);
    setCompletedIds(prev => {
      const next = new Set(prev);
      STEPS.forEach(s => { if (phaseIndex(s.id) < idx) next.add(s.id); });
      return next;
    });
  }, [phase?.phase]);

  useEffect(() => {
    if (!isVisible) setCompletedIds(new Set());
  }, [isVisible]);

  const visibleSteps = STEPS.filter(s =>
    completedIds.has(s.id) || (!isComplete && phaseIndex(s.id) === currentIdx)
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          style={{ maxWidth: '88%', paddingLeft: 4 }}
        >
          {/* Header: orb + status text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: visibleSteps.length > 0 ? 8 : 0 }}>
            <MiniOrb active={isActive} />
            <AnimatePresence mode="wait">
              <motion.span
                key={phase?.message ?? 'start'}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.13 }}
                style={{ fontSize: 13.5, fontFamily: F }}
              >
                {isError ? (
                  <span style={{ color: '#ff6b6b' }}>Something went wrong</span>
                ) : isComplete ? (
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>Done</span>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>Buildable</span>
                    <span style={{ color: 'rgba(255,255,255,0.38)' }}> is building…</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Step list — clean, no card */}
          {visibleSteps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 31 }}>
              {visibleSteps.map(step => {
                const done = completedIds.has(step.id);
                const active = !done && phaseIndex(step.id) === currentIdx;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                  >
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                        <circle cx="6" cy="6" r="5" fill="#22c55e" />
                        <path d="M3.5 6l1.7 1.7 3.3-3.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    ) : active ? (
                      <motion.div
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', flexShrink: 0, margin: '0 3px' }}
                      />
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0, margin: '0 3px' }} />
                    )}
                    <span style={{
                      fontSize: 11.5, fontFamily: F,
                      color: done ? 'rgba(255,255,255,0.3)' : active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.18)',
                    }}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}

              {filesDelivered > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                    <circle cx="6" cy="6" r="5" fill="#3b82f6" />
                    <text x="6" y="8.5" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">f</text>
                  </svg>
                  <span style={{ fontSize: 11.5, fontFamily: F, color: 'rgba(255,255,255,0.3)' }}>
                    {filesDelivered} file{filesDelivered !== 1 ? 's' : ''} written
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Cancel */}
          {isActive && onCancel && (
            <button
              onClick={onCancel}
              style={{
                marginTop: 8, marginLeft: 31,
                background: 'none', border: 'none', padding: 0,
                fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: F,
                cursor: 'pointer', textDecoration: 'underline',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}
            >
              Cancel generation
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
