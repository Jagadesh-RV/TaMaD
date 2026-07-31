import { useCallback, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass';
type Size = 'sm' | 'md' | 'lg';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  to?: undefined;
  href?: undefined;
}

interface ButtonAsLink extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> {
  to: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-[0_8px_30px_rgb(37,99,235,0.35)] hover:bg-brand-500 hover:shadow-[0_10px_36px_rgb(37,99,235,0.45)] border border-transparent',
  secondary:
    'bg-white/80 text-navy-900 dark:bg-white/10 dark:text-white border border-navy-900/10 dark:border-white/15 backdrop-blur-md hover:bg-white dark:hover:bg-white/15 shadow-sm',
  ghost:
    'text-navy-800 dark:text-slate-200 hover:bg-navy-900/5 dark:hover:bg-white/10 border border-transparent',
  outline:
    'border border-navy-900/15 dark:border-white/20 text-navy-900 dark:text-white hover:border-brand-500/60 hover:text-brand-600 dark:hover:text-brand-300 bg-transparent',
  glass:
    'bg-white/70 dark:bg-white/[0.08] border border-white/40 dark:border-white/15 text-navy-900 dark:text-white backdrop-blur-xl hover:bg-white/90 dark:hover:bg-white/[0.14] shadow-[0_8px_32px_rgb(15,23,42,0.12)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-[52px] px-7 text-[15px] gap-2.5 rounded-2xl',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = nextId.current++;
    setRipples((prev) => [...prev, { id, x, y, size }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }, []);

  const classes = clsx(
    'relative inline-flex items-center justify-center overflow-hidden font-semibold transition-all duration-300 select-none active:scale-[0.98]',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  const content = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute z-0 rounded-full bg-white/40 dark:bg-white/25"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            transform: 'scale(0)',
            animation: 'btn-ripple 0.65s ease-out forwards',
          }}
        />
      ))}
    </>
  );

  const motionProps = {
    initial: { opacity: 0, y: 8, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  };

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest;
    return (
      <motion.div {...motionProps} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
        <Link to={to} className={classes} onClick={handleClick} {...(linkRest as object)}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      onClick={handleClick}
      {...(rest as object)}
    >
      {content}
    </motion.button>
  );
}
