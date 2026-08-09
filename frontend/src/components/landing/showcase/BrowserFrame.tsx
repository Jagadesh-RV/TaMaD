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

      <motion.div
        className="card relative overflow-hidden"
        animate={float ? { y: [0, -12, 0] } : undefined}
        transition={float ? { duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: float } : undefined}
      >
        <div className="relative flex h-10 items-center justify-center border-b border-border-light bg-surface px-4">
          <div className="absolute left-4 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex max-w-[70%] items-center gap-1.5 rounded-lg bg-surface-active px-3 py-1 text-[10px] font-medium text-foreground-tertiary">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
              <rect x="1" y="4.5" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
              <path d="M4 4.5V3.75a2 2 0 1 1 4 0v.75" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            <span className="truncate">{url}</span>
          </div>
        </div>
        <div className={clsx('relative bg-background', tall ? 'h-[520px]' : 'h-[420px]')}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
