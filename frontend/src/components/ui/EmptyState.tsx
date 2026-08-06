import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--color-surface-active)] shadow-inner text-[color:var(--color-muted)]">
        <Icon size={40} />
      </div>
      <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-[color:var(--color-foreground)]">{title}</h3>
      <p className="mb-8 max-w-sm text-[15px] font-medium leading-relaxed text-[color:var(--color-foreground-secondary)]">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex h-12 items-center justify-center rounded-2xl bg-[color:var(--color-foreground)] px-8 font-bold text-[color:var(--color-background)] transition-transform hover:scale-105 active:scale-95 shadow-md"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
