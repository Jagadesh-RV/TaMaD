import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
  delay?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1, delay = 0 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: delay + (i * 0.04) }}
          className={clsx('skeleton', className)}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-2.5 w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-5/6" />
        <Skeleton className="h-2.5 w-3/4" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </motion.div>
  );
};

export const SkeletonStat: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="stat-card"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 rounded mt-1" />
      <Skeleton className="h-2.5 w-32 rounded" />
    </motion.div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} delay={i * 0.04} />
      ))}
    </div>
  );
};

export const SkeletonStatGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} delay={i * 0.05} />
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="table-container">
      {/* Header skeleton */}
      <div className="flex gap-4 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton
            key={j}
            className={clsx('h-3', j === 0 ? 'w-1/4' : j === cols - 1 ? 'w-1/8' : 'flex-1')}
          />
        ))}
      </div>
      {/* Row skeletons */}
      <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center px-4 py-3">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" delay={i * 0.04} />
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <Skeleton
                key={j}
                delay={i * 0.04}
                className={clsx('h-3', j === 0 ? 'flex-1' : j === cols - 2 ? 'w-1/5' : 'w-1/4')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonKanban: React.FC<{ columns?: number; cardsPerCol?: number }> = ({
  columns = 4,
  cardsPerCol = 3,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: columns }).map((_, col) => (
        <div key={col} className="shrink-0" style={{ width: 300, minWidth: 300 }}>
          {/* Column header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <Skeleton className="h-3 w-20" delay={col * 0.05} />
            <Skeleton className="h-5 w-8 rounded-full" delay={col * 0.05} />
          </div>
          {/* Cards */}
          <div className="space-y-2">
            {Array.from({ length: cardsPerCol }).map((_, card) => (
              <div key={card} className="card p-3 space-y-2.5">
                <Skeleton className="h-3 w-3/4" delay={col * 0.05 + card * 0.03} />
                <Skeleton className="h-2.5 w-full" delay={col * 0.05 + card * 0.03} />
                <Skeleton className="h-2.5 w-5/6" delay={col * 0.05 + card * 0.03} />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" delay={col * 0.05 + card * 0.03} />
                  <Skeleton className="h-6 w-6 rounded-full" delay={col * 0.05 + card * 0.03} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: i * 0.04 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="flex-1 flex items-center gap-3">
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
