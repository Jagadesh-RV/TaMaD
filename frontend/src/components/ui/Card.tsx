import * as React from 'react';
import { clsx } from 'clsx';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'elevated';
};

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface',
        variant === 'elevated' && 'shadow-soft',
        className,
      )}
      {...props}
    />
  );
}

export default Card;
