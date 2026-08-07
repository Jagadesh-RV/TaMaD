// src/utils/motion.ts
import { Variants, Transition } from 'framer-motion';

// ---------------------------------------------------------------------------
// Premium motion system
// Spring physics tuned for a living, tactile interface.
// Every curve below is intentional: calm, weighty, and never decorative.
// ---------------------------------------------------------------------------

// Signature easing used across the whole experience (Apple/Framer feel)
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.87, 0, 0.13, 1] as const;

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 1,
};

export const springSlow: Transition = {
  type: 'spring',
  stiffness: 250,
  damping: 40,
  mass: 1,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 1,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 28,
  mass: 1.1,
};

type EasingArray = readonly [number, number, number, number];

export const tween = (duration = 0.4, ease: EasingArray = EASE_OUT_EXPO): Transition => ({
  type: 'tween',
  duration,
  ease,
});

// Page transitions — a "reveal choreography" with depth and blur
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.995, filter: 'blur(10px)' },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { ...tween(0.6), when: 'beforeChildren', staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.995,
    filter: 'blur(6px)',
    transition: tween(0.25, EASE_IN_OUT),
  },
};

// List stagger animations
export const listContainerVariants: Variants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springGentle,
  },
};

// Modals and overlays — layered depth
export const overlayVariants: Variants = {
  initial: { opacity: 0, backdropFilter: 'blur(0px)' },
  enter: { opacity: 1, backdropFilter: 'blur(14px)', transition: tween(0.35) },
  exit: { opacity: 0, backdropFilter: 'blur(0px)', transition: tween(0.25, EASE_IN_OUT) },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 24, filter: 'blur(6px)' },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 12,
    filter: 'blur(4px)',
    transition: tween(0.2, EASE_IN_OUT),
  },
};

// Micro-interactions
export const hoverScale = {
  scale: 1.02,
  transition: springBouncy,
};

export const tapScale = {
  scale: 0.96,
  transition: springBouncy,
};

export const popoverVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 6, filter: 'blur(4px)' },
  enter: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: springBouncy },
  exit: { opacity: 0, scale: 0.96, y: 6, filter: 'blur(4px)', transition: tween(0.15, EASE_IN_OUT) },
};

// Reveal choreography for scroll-based storytelling
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...tween(0.7), delay: i * 0.08 },
  }),
};

export const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...springGentle, delay: i * 0.07 },
  }),
};

// Shared layout animation preset for morphing elements
export const morph: Transition = {
  ...springGentle,
};
