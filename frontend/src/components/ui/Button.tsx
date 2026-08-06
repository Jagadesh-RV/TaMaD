import * as React from 'react';
import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

const variantClasses = {
  primary: 'border-transparent bg-[color:var(--color-accent)] text-white shadow-soft hover:brightness-95',
  secondary: 'border-border bg-surface text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-hover)]',
  ghost: 'border-transparent bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-hover)] shadow-none',
  outline: 'border-border bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-hover)]',
  danger: 'border-transparent bg-[color:var(--color-danger)] text-white shadow-soft hover:brightness-95',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});

export default Button;
