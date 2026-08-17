import * as React from 'react';
import { clsx } from 'clsx';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'elevated';
  interactive?: boolean;
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'default', interactive = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx(
        'card',
        variant === 'elevated' && 'shadow-md',
        interactive && 'cursor-pointer hover:shadow-md transition-shadow',
        className,
      )}
      {...props}
    />
  );
});

export default Card;
