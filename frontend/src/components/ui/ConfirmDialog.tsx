import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from './Dialog';
import { Button } from './Button';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirmRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => confirmRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="w-full max-w-md">
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              variant === 'danger'
                ? 'bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)]'
                : 'bg-[color:var(--color-accent-light)] text-[color:var(--color-accent)]',
            )}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle>{title}</DialogTitle>
            {message && <DialogDescription>{message}</DialogDescription>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default ConfirmDialog;
