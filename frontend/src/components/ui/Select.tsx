import * as React from 'react';
import { clsx } from 'clsx';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>;
};

export function Select({ className, options, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition-all focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/15',
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
