import * as React from 'react';
import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
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
