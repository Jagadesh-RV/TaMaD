import * as React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

type CardProps = HTMLMotionProps<"div"> & {
  variant?: 'default' | 'elevated' | 'glass';
  interactive?: boolean;
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'default', interactive = false, whileHover, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={interactive ? (whileHover ?? { y: -2 }) : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={clsx(
        'card',
        variant === 'glass' && 'glass',
        interactive && 'cursor-pointer',
        className,
      )}
      {...props}
    />
  );
});

export default Card;
