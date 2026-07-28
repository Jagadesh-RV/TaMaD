import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8" style={{ background: 'var(--color-background)' }}>
      <div className="text-center">
        <p
          className="mb-4 text-[120px] font-bold leading-none"
          style={{ color: 'var(--color-border)' }}
        >
          404
        </p>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Page Not Found
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn btn-ghost">
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
