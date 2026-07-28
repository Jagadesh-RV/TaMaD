import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 24, text, fullPage = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 
        size={size} 
        className="animate-spin" 
        style={{ color: 'var(--color-accent)' }} 
      />
      {text && (
        <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center py-32">
        {content}
      </div>
    );
  }
  return content;
}
