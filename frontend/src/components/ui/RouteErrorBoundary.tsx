import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class RouteErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RouteErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)]">
            <AlertTriangle size={24} />
          </div>
          <p className="mb-2 text-lg font-semibold text-[color:var(--color-foreground)]">
            This page failed to load
          </p>
          <p className="mb-6 text-sm text-[color:var(--color-foreground-secondary)] max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred on this page.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[color:var(--color-surface-active)] px-6 text-sm font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-hover)]"
          >
            <RefreshCw size={16} />
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
