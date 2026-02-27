import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface SparklePoint {
  id: number;
  x: number;
  y: number;
}

const PARTICLE_COUNT = 10;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
  const dist = 24 + (i % 3) * 10;
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
            background: i % 2 === 0 ? "#ffffff" : "#222222",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* 4-pointed star burst */}
      <motion.div
        initial={{ scale: 0, opacity: 1, rotate: 0 }}
        animate={{ scale: 2, opacity: 0, rotate: 45 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ position: "absolute", transform: "translate(-50%, -50%)", pointerEvents: "none" }}
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

  // Very snappy spring — hotspot must feel 1:1 with the actual pointer
  const cursorX = useSpring(mouseX, { stiffness: 900, damping: 50 });
  const cursorY = useSpring(mouseY, { stiffness: 900, damping: 50 });

  const [clicking, setClicking] = useState(false);
  const [sparkles, setSparkles] = useState<SparklePoint[]>([]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onClick = (e: MouseEvent) => {
      const id = Date.now() + Math.random();
      setSparkles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== id)), 700);
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
      {/*
        The arrow SVG tip is at (0,0) in its coordinate space.
        We position the div exactly at the mouse — no centering offset —
        so the hotspot is at the very tip of the arrow.
      */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: cursorX,
          y: cursorY,
          pointerEvents: "none",
          zIndex: 99999,
          // No translateX/Y — tip of arrow = mouse position
        }}
        animate={{ scale: clicking ? 0.85 : 1 }}
        transition={{ duration: 0.1 }}
      >
        {/*
          Arrow cursor shape:
          - Tip at (0,0) — this is the hotspot
          - Left edge goes straight down
          - Notch cut at ~60% down
          - Tail extends below the body
          - overflow="visible" so the stroke at the tip isn't clipped
        */}
        {/*
          Bezier-curved arrow cursor — tip at (0,0) in SVG space = mouse hotspot.
          Q = quadratic bezier for smooth rounded corners at every joint.
        */}
        <svg
          width="24"
          height="30"
          viewBox="0 0 13 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <path
            d={[
              "M 0.8,0.8",                       // tip (hotspot)
              "L 0.8,14.5",                       // left edge down
              "Q 0.8,16.2 2.2,15.2",             // rounded bottom-left
              "L 4.8,12.8",                       // notch inward
              "Q 5.5,12.0 6.1,13.2",             // rounded notch corner
              "L 8.6,19.2",                       // tail going down
              "Q 9.2,20.8 10.4,20.0",            // rounded tail tip
              "L 11.4,19.2",                      // right of tail
              "Q 12.2,18.6 11.6,17.6",           // rounded tail-right corner
              "L 8.6,11.8",                       // back up body right
              "Q 8.2,11.0 9.2,11.0",             // rounded body shoulder
              "L 11.6,11.0",                      // across body top
              "Q 12.8,11.0 12.2,9.6",            // rounded top-right corner
              "Z",                                // close back to tip
            ].join(" ")}
            fill="white"
            stroke="black"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Click sparkles */}
      <AnimatePresence>
        {sparkles.map((s) => (
          <SparkleEffect key={s.id} x={s.x} y={s.y} />
        ))}
      </AnimatePresence>
    </>
  );
}
