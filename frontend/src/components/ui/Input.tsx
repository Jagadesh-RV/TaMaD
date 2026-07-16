import * as React from 'react';
import { clsx } from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted)] outline-none transition-all focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/15',
        className,
      )}
      {...props}
    />
  );
}

export default Input;
