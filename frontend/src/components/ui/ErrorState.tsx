import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div 
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}
      >
        <AlertTriangle size={24} />
      </div>
      <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
        {message}
      </p>
      <p className="mb-4 text-xs" style={{ color: 'var(--color-muted)' }}>
        Please try again later.
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}
