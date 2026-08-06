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
          transition={{ duration: 0.3, delay: delay + (i * 0.05) }}
          className={clsx('skeleton', className)}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card p-6 space-y-4"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </motion.div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} delay={i * 0.05} />
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="table-container p-1">
      <div className="space-y-4 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                delay={i * 0.05}
                className={clsx('h-4', j === 0 ? 'w-1/4' : j === cols - 1 ? 'w-1/6' : 'flex-1')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
