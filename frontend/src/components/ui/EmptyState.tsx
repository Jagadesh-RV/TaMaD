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
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  steps?: string[];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  steps,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-[color:var(--color-surface)] text-[color:var(--color-foreground-tertiary)]">
        <Icon size={36} strokeWidth={1.5} />
      </div>

      <h3 className="mb-3 text-xl font-semibold tracking-tight text-[color:var(--color-foreground)]">{title}</h3>
      <p className="mb-7 max-w-sm text-[15px] leading-relaxed text-[color:var(--color-foreground-secondary)]">
        {description}
      </p>

      {steps && steps.length > 0 && (
        <div className="mb-7 w-full max-w-sm space-y-2 text-left">
          {steps.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-lg border border-[color:var(--color-border-light)] bg-[color:var(--color-background)] px-3.5 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent-ghost)] text-[11px] font-bold text-[color:var(--color-accent)]">
                {i + 1}
              </span>
              <span className="text-[13px] font-medium text-[color:var(--color-foreground)]">{step}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="btn btn-primary btn-md"
          >
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="btn btn-secondary btn-md"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
