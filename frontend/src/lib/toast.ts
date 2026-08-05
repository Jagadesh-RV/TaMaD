import toast from 'react-hot-toast';

export const TOAST_DURATION = 3000;

export const toastConfig = {
  duration: TOAST_DURATION,
  position: 'top-right' as const,
  style: {
    background: 'var(--color-surface)',
    color: 'var(--color-foreground)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '12px 16px',
  },
};

export const showToast = {
  success: (message: string) => toast.success(message, toastConfig),
  error: (message: string) => toast.error(message, toastConfig),
  loading: (message: string) => toast.loading(message, toastConfig),
  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => toast.promise(promise, msgs, toastConfig),
};

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    return axiosError.response?.data?.error || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};
