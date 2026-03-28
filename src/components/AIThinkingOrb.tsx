import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TASKS = [
  'Crafting an advanced ticketing system...',
  'Building a moderation suite for your server...',
  'Designing a music bot with Spotify integration...',
  'Creating a welcome & farewell system...',
  'Optimising a levelling & XP bot...',
  'Planning a server economy system...',
  'Generating a custom role assignment bot...',
  'Architecting a multi-guild deployment...',
  'Wiring up a stream notification bot...',
  'Compiling a birthday reminder system...',
];

interface Particle {
  phi: number;
  theta: number;
}

interface Pulse {
  phi0: number;
  theta0: number;
  radius: number;
  speed: number;
  intensity: number;
  maxRadius: number;
}

export default function AIThinkingOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [taskIdx, setTaskIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setTaskIdx((i) => (i + 1) % TASKS.length),
      4500,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800, H = 800;
    const CX = W / 2, CY = H / 2;
    const R = 340;
    const FOV = 780;

    // Fibonacci sphere distribution
    const N = 300;
    const particles: Particle[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const cosP = 1 - (2 * i) / (N - 1);
      const phi = Math.acos(Math.max(-1, Math.min(1, cosP)));
      const theta = (golden * i) % (2 * Math.PI);
      particles.push({ phi, theta });
    }

    let pulses: Pulse[] = [];
    let frame = 0;
    let rotY = 0;
    const tiltX = 0.3;
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);

    function spawnPulse() {
      pulses.push({
        phi0: Math.random() * Math.PI,
        theta0: Math.random() * 2 * Math.PI,
        radius: 0,
        speed: 0.016 + Math.random() * 0.01,
        intensity: 0.55 + Math.random() * 0.45,
        maxRadius: Math.PI * (0.5 + Math.random() * 0.5),
      });
    }

    spawnPulse();
    spawnPulse();

    let raf = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;
      rotY += 0.006;

      if (frame % 85 === 0) spawnPulse();
      pulses = pulses.filter((p) => p.radius < p.maxRadius);
      for (const p of pulses) p.radius += p.speed;

      // Ambient orb glow
      const grd = ctx.createRadialGradient(CX, CY, R * 0.15, CX, CY, R * 1.15);
      grd.addColorStop(0, 'rgba(160,165,195,0.05)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Project particles
      const pts = particles.map((p) => {
        const sinP = Math.sin(p.phi);
        const x = R * sinP * Math.cos(p.theta + rotY);
        const y = R * Math.cos(p.phi);
        const z = R * sinP * Math.sin(p.theta + rotY);

        // X-axis tilt
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;

        // Perspective
        const scale = FOV / (FOV + z2 + R * 0.08);
        const sx = CX + x * scale;
        const sy = CY + y2 * scale;
        const depth = (z2 + R) / (2 * R); // 0=back 1=front

        const baseAlpha = 0.18 + depth * 0.65;
        const baseSize = 0.6 + depth * 1.5;

        // Pulse boost — angular distance from each pulse origin
        let boost = 0;
        for (const pulse of pulses) {
          const cosD =
            Math.cos(pulse.phi0) * Math.cos(p.phi) +
            Math.sin(pulse.phi0) * Math.sin(p.phi) *
            Math.cos(pulse.theta0 - p.theta); // unrotated space
          const d = Math.acos(Math.max(-1, Math.min(1, cosD)));
          const wave = Math.abs(d - pulse.radius);
          const fade = 1 - pulse.radius / pulse.maxRadius;
          if (wave < 0.2) {
            boost = Math.max(boost, pulse.intensity * (1 - wave / 0.2) * fade);
          }
        }

        return { sx, sy, depth, baseAlpha, baseSize, boost };
      });

      // Back-to-front sort
      pts.sort((a, b) => a.depth - b.depth);

      for (const { sx, sy, baseAlpha, baseSize, boost } of pts) {
        const alpha = Math.min(1, baseAlpha + boost * 0.85);
        const size = baseSize + boost * 3.2;

        // Soft halo on pulsed dots
        if (boost > 0.14) {
          ctx.beginPath();
          ctx.arc(sx, sy, size * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,215,250,${(boost * 0.13).toFixed(3)})`;
          ctx.fill();
        }

        // Core dot — neutral silver-grey, brighter with pulse
        const v = Math.round(175 + boost * 60);
        const b = Math.round(190 + boost * 55);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${v},${v},${b},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer-sweep {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        .orb-shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.22) 0%,
            rgba(255,255,255,0.22) 35%,
            rgba(255,255,255,0.85) 50%,
            rgba(255,255,255,0.22) 65%,
            rgba(255,255,255,0.22) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer-sweep 3.2s linear infinite;
        }
      `}</style>
      <div
        className="flex flex-col items-center select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          style={{ width: 'min(100%, 520px)', height: 'auto', display: 'block' }}
        />
        <div
          style={{
            marginTop: '12px',
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            height: '1.4em',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={taskIdx}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.38 }}
              className="orb-shimmer-text"
              style={{ display: 'block' }}
            >
              {TASKS[taskIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
