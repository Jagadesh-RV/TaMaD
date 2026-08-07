import * as React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

type CardProps = HTMLMotionProps<"div"> & {
  variant?: 'default' | 'elevated' | 'glass' | 'luminous';
  interactive?: boolean;
};

/**
 * Card — a depth layer of the experience.
 *
 * `variant="luminous"` casts a soft aurora sheen along the top edge and
 * responds to hover with a lifted, breathing glow. `glass` turns the card
 * into a frosted pane of light. Every variant uses spring physics.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'default', interactive = false, whileHover, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={interactive ? (whileHover ?? { y: -3 }) : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={clsx(
        'card',
        variant === 'glass' && 'glass',
        variant === 'luminous' && 'card-luminous',
        interactive && 'cursor-pointer',
        className,
      )}
      {...props}
    />
  );
});

export default Card;
