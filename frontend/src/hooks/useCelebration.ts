import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

export function useCelebration() {
  const triggerConfetti = useCallback((options?: confetti.Options) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      ...options,
    });
  }, []);

  const celebrateMilestone = useCallback(
    (title: string, message?: string) => {
      triggerConfetti();
      toast.success(message || 'Milestone achieved!', {
        position: 'bottom-center',
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '12px 16px',
          fontWeight: 600,
        },
        icon: '🎉',
      });
    },
    [triggerConfetti]
  );

  return { triggerConfetti, celebrateMilestone };
}
