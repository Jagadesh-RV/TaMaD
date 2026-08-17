import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)]">
        <AlertTriangle size={24} />
      </div>
      <p className="mb-2 text-lg font-semibold text-[color:var(--color-foreground)]">
        {message}
      </p>
      <p className="mb-6 max-w-sm text-sm text-[color:var(--color-foreground-secondary)]">
        Please try again later.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[color:var(--color-surface-active)] px-6 text-sm font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-hover)]"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}
