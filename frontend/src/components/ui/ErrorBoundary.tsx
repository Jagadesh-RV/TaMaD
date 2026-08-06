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
          <Card className="max-w-lg w-full p-10 text-center shadow-xl border border-[color:var(--color-danger-light)]">
            <div
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[color:var(--color-danger-ghost)] text-[color:var(--color-danger)] shadow-sm"
            >
              <AlertTriangle size={40} />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[color:var(--color-foreground)]">
              Something went wrong
            </h2>
            <p className="mb-10 text-[15px] font-medium leading-relaxed text-[color:var(--color-foreground-secondary)] max-w-sm mx-auto">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex w-full h-14 items-center justify-center gap-3 rounded-2xl bg-[color:var(--color-foreground)] px-8 font-bold text-[color:var(--color-background)] transition-transform hover:scale-[1.02] active:scale-95 shadow-md"
            >
              <RefreshCw size={20} />
              Reload Page
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
