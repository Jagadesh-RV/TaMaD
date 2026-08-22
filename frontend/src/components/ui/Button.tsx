import * as React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'outline-accent';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        'btn',
        `btn-${variant}`,
        size === 'md' ? 'btn-md' : '',
        size === 'sm' ? 'btn-sm' : '',
        size === 'lg' ? 'btn-lg' : '',
        size === 'icon' ? 'btn-icon' : '',
        size === 'icon-sm' ? 'btn-icon-xs' : '', // map to xs
        size === 'icon-lg' ? 'btn-icon-lg' : '',
        isLoading && 'opacity-80 pointer-events-none cursor-wait',
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
});

export default Button;
