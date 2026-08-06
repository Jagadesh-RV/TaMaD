// src/utils/motion.ts
import { Variants } from 'framer-motion';

// Premium spring physics for smooth, natural motion
export const spring = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 1,
};

export const springSlow = {
  type: 'spring',
  stiffness: 250,
  damping: 40,
  mass: 1,
};

export const springBouncy = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 1,
};

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 15, filter: 'blur(8px)' },
  enter: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { ...springSlow, staggerChildren: 0.05 } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    filter: 'blur(4px)',
    transition: { duration: 0.2, ease: 'easeIn' } 
  }
};

// List stagger animations
export const listContainerVariants: Variants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1
    }
  }
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  enter: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: spring
  }
};

// Modals and Overlays
export const overlayVariants: Variants = {
  initial: { opacity: 0, backdropFilter: 'blur(0px)' },
  enter: { opacity: 1, backdropFilter: 'blur(12px)', transition: { duration: 0.3 } },
  exit: { opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.2 } }
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  enter: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: spring 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: 10, 
    transition: { duration: 0.2 } 
  }
};

// Micro-interactions
export const hoverScale = {
  scale: 1.02,
  transition: springBouncy
};

export const tapScale = {
  scale: 0.97,
  transition: springBouncy
};

export const popoverVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 4, filter: 'blur(4px)' },
  enter: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: springBouncy },
  exit: { opacity: 0, scale: 0.96, y: 4, filter: 'blur(4px)', transition: { duration: 0.15 } }
};
