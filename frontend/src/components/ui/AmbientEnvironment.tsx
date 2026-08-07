import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * AmbientEnvironment
 * ------------------
 * The living atmosphere of TaMaD. A layered field of drifting aurora light,
 * cinematic grain, and a soft glow that follows the cursor — all rendered
 * behind every screen so the workspace feels like it is breathing with you.
 *
 * Rendered as a fixed, pointer-events-none layer. Content sits above it.
 */
export default function AmbientEnvironment() {
  const mx = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const my = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const glowX = useSpring(mx, { stiffness: 40, damping: 25, mass: 0.8 });
  const glowY = useSpring(my, { stiffness: 40, damping: 25, mass: 0.8 });

  useEffect(() => {
    const handlePointer = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointer);
  }, [mx, my]);

  return (
    <div className="ambient-env pointer-events-none" aria-hidden="true">
      {/* Cursor halo — the surface responds to your hand */}
      <motion.div
        className="ambient-cursor-glow"
        style={{ x: glowX, y: glowY }}
      />

      {/* Drifting aurora orbs */}
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />

      {/* Soft horizon light */}
      <div className="ambient-horizon" />

      {/* Cinematic grain */}
      <div className="ambient-grain" />
    </div>
  );
}
