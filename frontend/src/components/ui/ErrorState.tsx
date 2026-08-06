import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div 
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-sm bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)]"
      >
        <AlertTriangle size={32} />
      </div>
      <p className="mb-3 text-2xl font-extrabold tracking-tight text-[color:var(--color-foreground)]">
        {message}
      </p>
      <p className="mb-8 max-w-sm text-[15px] font-medium leading-relaxed text-[color:var(--color-foreground-secondary)]">
        Please try again later.
      </p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-surface-active)] px-8 font-bold text-[color:var(--color-foreground)] transition-all hover:bg-[color:var(--color-surface-hover)] active:scale-95 shadow-sm"
        >
          <RefreshCw size={18} />
          Retry
        </button>
      )}
    </motion.div>
  );
}
