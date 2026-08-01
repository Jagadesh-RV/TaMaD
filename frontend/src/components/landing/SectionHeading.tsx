import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
  eyebrowClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  eyebrowClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        'mb-14 max-w-3xl md:mb-20',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={clsx(
              'mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 dark:border-brand-400/25 dark:bg-brand-400/10 dark:text-brand-300',
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 dark:text-white md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.12}>
          <p className="mt-5 text-pretty text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
