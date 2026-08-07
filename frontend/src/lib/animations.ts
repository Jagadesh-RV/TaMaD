import { Variants, Transition } from 'framer-motion';

// ---------------------------------------------------------------------------
// Shared animation vocabulary
// A single source of truth for the TaMaD experience. Components import these
// presets so every screen moves with the same physics and personality.
// ---------------------------------------------------------------------------

export const SPRING: Transition = { type: 'spring', stiffness: 380, damping: 30, mass: 1 };
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 260, damping: 32, mass: 1.05 };
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: SPRING_SOFT },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18, ease: 'easeIn' } },
};

export const blurReveal: Variants = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_OUT } },
  exit: { opacity: 0, y: -12, filter: 'blur(6px)', transition: { duration: 0.2, ease: 'easeIn' } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: SPRING },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: 'easeIn' } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const cardVariant: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRING_SOFT,
  },
};

export const stagger = (staggerChildren = 0.07, delayChildren = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});
