import * as React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', whileHover, whileTap, ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={whileHover ?? { scale: 1.02 }}
      whileTap={whileTap ?? { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={clsx(
        'btn',
        `btn-${variant}`,
        size === 'md' ? 'btn-md' : '',
        size === 'sm' ? 'btn-sm' : '',
        size === 'lg' ? 'btn-lg' : '',
        size === 'icon' ? 'btn-icon' : '',
        size === 'icon-sm' ? 'btn-icon-sm' : '',
        className,
      )}
      {...props}
    />
  );
});

export default Button;
