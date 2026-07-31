import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none' | 'scale';

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  distance?: number;
  amount?: number;
}

const initialByDirection = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up': return { opacity: 0, y: distance };
    case 'down': return { opacity: 0, y: -distance };
    case 'left': return { opacity: 0, x: distance };
    case 'right': return { opacity: 0, x: -distance };
    case 'scale': return { opacity: 0, scale: 0.92 };
    default: return { opacity: 0 };
  }
};

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  once = true,
  className,
  distance = 32,
  amount = 0.2,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={initialByDirection(direction, distance)}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
