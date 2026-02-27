import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface SparklePoint {
  id: number;
  x: number;
  y: number;
}

const PARTICLE_COUNT = 10;

// Precompute per-particle angles + distances so they're stable
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
  const dist = 24 + (i % 3) * 10; // 24 | 34 | 44 — varied radii
  return { angle, dist };
});

function SparkleEffect({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        pointerEvents: "none",
        zIndex: 99990,
        transform: "translate(-50%, -50%)",
      }}
    >
      {PARTICLES.map(({ angle, dist }, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            scale: 0.1,
          }}
          transition={{ duration: 0.55 + (i % 3) * 0.08, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: i % 3 === 0 ? 5 : 3,
            height: i % 3 === 0 ? 5 : 3,
            background: i % 2 === 0 ? "#ffffff" : "#111111",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* 4-pointed star burst at center */}
      <motion.div
        initial={{ scale: 0, opacity: 1, rotate: 0 }}
        animate={{ scale: 2, opacity: 0, rotate: 45 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"
            fill="white"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default function CustomCursor() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Dot: very snappy
  const dotX = useSpring(mouseX, { stiffness: 700, damping: 40 });
  const dotY = useSpring(mouseY, { stiffness: 700, damping: 40 });

  // Ring: slightly lagging
  const ringX = useSpring(mouseX, { stiffness: 160, damping: 22 });
  const ringY = useSpring(mouseY, { stiffness: 160, damping: 22 });

  const [clicking, setClicking] = useState(false);
  const [sparkles, setSparkles] = useState<SparklePoint[]>([]);

  useEffect(() => {
    // Don't mount on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onClick = (e: MouseEvent) => {
      const id = Date.now() + Math.random();
      setSparkles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, 700);
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Outer lagging ring */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "2px solid #000",
          background: "transparent",
          pointerEvents: "none",
          zIndex: 99997,
        }}
        animate={{ scale: clicking ? 0.8 : 1 }}
        transition={{ duration: 0.12 }}
      />

      {/* Inner dot — white fill, black rim */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#ffffff",
          border: "2.5px solid #000000",
          pointerEvents: "none",
          zIndex: 99999,
        }}
        animate={{ scale: clicking ? 0.6 : 1 }}
        transition={{ duration: 0.1 }}
      />

      {/* Click sparkles */}
      <AnimatePresence>
        {sparkles.map((s) => (
          <SparkleEffect key={s.id} x={s.x} y={s.y} />
        ))}
      </AnimatePresence>
    </>
  );
}
