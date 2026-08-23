import clsx from 'clsx';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: 'brand' | 'neutral' | 'success' | 'warning';
}

const tones = {
  brand: 'border-brand-500/25 bg-brand-500/10 text-brand-700 ',
  neutral: 'border-slate-900/10 bg-slate-900/5 text-[color:var(--color-foreground)]  :var(--color-surface)] :var(--color-muted)]',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 ',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-700 ',
};

export function Badge({ children, className, tone = 'brand' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
