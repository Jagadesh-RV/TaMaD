import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './Card';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8 bg-[color:var(--color-background)]">
          <Card className="max-w-md w-full p-8 text-center border border-[color:var(--color-danger-light)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)]">
              <AlertTriangle size={24} />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[color:var(--color-foreground)]">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-[color:var(--color-foreground-secondary)] max-w-xs mx-auto">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-[color:var(--color-foreground)] px-6 text-sm font-medium text-[color:var(--color-background)] transition-colors hover:opacity-90"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
