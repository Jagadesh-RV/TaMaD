import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function FormField({
  label,
  hint,
  error,
  required,
  className,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={clsx('form-field', className)}>
      {label && (
        <label htmlFor={htmlFor} className="form-label">
          {label}
          {required && (
            <span className="ml-0.5" style={{ color: 'var(--color-danger)' }} aria-hidden="true">*</span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && (
        <p className="form-error" role="alert" aria-live="polite">{error}</p>
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, hint, error, size = 'md', leftIcon, rightIcon, className, id, required, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <FormField label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-foreground-tertiary)' }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              size === 'sm' ? 'input input-sm' : 'input',
              error && 'input-error',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            required={required}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-foreground-tertiary)' }}>
              {rightIcon}
            </span>
          )}
        </div>
      </FormField>
    );
  }
);
TextInput.displayName = 'TextInput';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, required, ...props }, ref) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <FormField label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'input',
            'resize-none',
            error && 'input-error',
            className
          )}
          aria-invalid={!!error}
          required={required}
          style={{ minHeight: '80px' }}
          {...props}
        />
      </FormField>
    );
  }
);
TextareaInput.displayName = 'TextareaInput';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, className, id, required, ...props }, ref) => {
    const inputId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <FormField label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <select
          ref={ref}
          id={inputId}
          className={clsx('input', error && 'input-error', className)}
          aria-invalid={!!error}
          required={required}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FormField>
    );
  }
);
SelectInput.displayName = 'SelectInput';
