import * as React from 'react';
import { clsx } from 'clsx';
import { XCircle } from 'lucide-react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  onClear?: () => void;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leftIcon, rightIcon, error, onClear, value, onChange, ...props },
  ref
) {
  const showClear = onClear && value && String(value).length > 0;

  return (
    <div className="relative flex items-center w-full group">
      {leftIcon && (
        <span className="absolute left-3 text-muted-foreground flex items-center justify-center pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        className={clsx(
          'input transition-all duration-200 outline-none',
          leftIcon ? 'pl-9' : '',
          (rightIcon || showClear) ? 'pr-9' : '',
          error && 'input-error',
          className
        )}
        {...props}
      />
      <div className="absolute right-3 flex items-center gap-1">
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm outline-none focus-visible:ring-2 ring-accent/50"
            aria-label="Clear input"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
        {rightIcon && <span className="text-muted-foreground flex items-center">{rightIcon}</span>}
      </div>
    </div>
  );
});

export default Input;
