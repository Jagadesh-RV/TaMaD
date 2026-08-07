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

/**
 * EmptyState — a teaching moment, never a void.
 * Guides the user forward with a glowing focus point, a story, and a
 * clear next action so a blank surface always feels like an invitation.
 */
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
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -12 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      <div className="relative mb-7">
        <div className="absolute -inset-4 rounded-full bg-[color:var(--color-accent-light)] blur-2xl animate-breathe" />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border bg-[color:var(--color-surface)] shadow-md text-[color:var(--color-accent)]"
        >
          <Icon size={40} strokeWidth={1.75} />
        </motion.div>
      </div>

      <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-[color:var(--color-foreground)]">{title}</h3>
      <p className="mb-7 max-w-sm text-[15px] font-medium leading-relaxed text-[color:var(--color-foreground-secondary)]">
        {description}
      </p>

      {steps && steps.length > 0 && (
        <div className="mb-7 w-full max-w-sm space-y-2 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-background)] px-3.5 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent-ghost)] text-[11px] font-extrabold text-[color:var(--color-accent)]">
                {i + 1}
              </span>
              <span className="text-[13px] font-semibold text-[color:var(--color-foreground)]">{step}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="btn btn-primary btn-lg rounded-full"
          >
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="btn btn-secondary btn-lg rounded-full"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
