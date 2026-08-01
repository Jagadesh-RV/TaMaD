import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-balance text-3xl font-extrabold tracking-tight text-navy-950 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-2.5 text-pretty text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, className, id, ...rest }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-navy-900 dark:text-slate-200">
        {label}
      </label>
      <input
        id={id}
        className={clsx(
          'h-12 w-full rounded-xl border bg-white/70 px-4 text-[14px] font-medium text-navy-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:bg-white/[0.04] dark:text-white',
          error
            ? 'border-rose-500/60 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
            : 'border-navy-900/10 hover:border-navy-900/20 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:hover:border-white/20',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function PasswordField({ label, error, id, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-navy-900 dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={clsx(
            'h-12 w-full rounded-xl border bg-white/70 px-4 pr-12 text-[14px] font-medium text-navy-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:bg-white/[0.04] dark:text-white',
            error
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
              : 'border-navy-900/10 hover:border-navy-900/20 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:hover:border-white/20',
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-navy-900 dark:hover:text-white"
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

export function GoogleButton({ onClick, disabled, label = 'Continue with Google' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-navy-900/10 bg-white text-[14px] font-semibold text-navy-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-900/20 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:border-white/25"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.17 3.58-8.81z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z" />
        <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76z" />
      </svg>
      {label}
    </button>
  );
}

export function AuthDivider({ label = 'or continue with email' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-navy-900/[0.08] dark:bg-white/10" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{label}</span>
      <span className="h-px flex-1 bg-navy-900/[0.08] dark:bg-white/10" />
    </div>
  );
}

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export function SubmitButton({ children, loading, className, ...rest }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={clsx(
        'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[14px] font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_10px_36px_rgba(37,99,235,0.45)] disabled:cursor-not-allowed disabled:opacity-70',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
