import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface BrowserFrameProps {
  children: ReactNode;
  url?: string;
  className?: string;
  float?: number;
  floatDuration?: number;
  glow?: string;
  tall?: boolean;
}

export function BrowserFrame({
  children,
  url = 'app.tamad.app',
  className,
  float = 0,
  floatDuration = 8,
  glow = 'rgba(37, 99, 235, 0.18)',
  tall = false,
}: BrowserFrameProps) {
  return (
    <motion.div
      className={clsx('group relative', className)}
      whileHover={{ y: -6, scale: 1.008 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="pointer-events-none absolute -inset-6 rounded-[32px] opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, ${glow}, transparent 70%)` }}
        aria-hidden="true"
      />
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-navy-900/[0.08] bg-white shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#0d1428] dark:shadow-[0_24px_70px_-24px_rgba(0,0,0,0.7)]"
        animate={float ? { y: [0, -12, 0] } : undefined}
        transition={float ? { duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: float } : undefined}
      >
        <div className="relative flex h-10 items-center justify-center border-b border-slate-200 bg-slate-50 px-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
          <div className="absolute left-4 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex max-w-[70%] items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-[10px] font-medium text-slate-400 dark:bg-white/[0.05] dark:text-slate-500">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
              <rect x="1" y="4.5" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
              <path d="M4 4.5V3.75a2 2 0 1 1 4 0v.75" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            <span className="truncate">{url}</span>
          </div>
        </div>
        <div className={clsx('relative bg-slate-50 dark:bg-[#0a0f1e]', tall ? 'h-[520px]' : 'h-[420px]')}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
