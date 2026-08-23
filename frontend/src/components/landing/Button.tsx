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
    'bg-brand-600 text-[color:var(--color-foreground)] shadow-[0_8px_30px_rgb(37,99,235,0.35)] hover:bg-brand-500 hover:shadow-[0_10px_36px_rgb(37,99,235,0.45)] border border-transparent',
  secondary:
    'bg-[color:var(--color-background)]/80 text-[color:var(--color-foreground)]  :var(--color-foreground)] border border-border  backdrop-blur-md hover:bg-white :bg-white/15 shadow-sm',
  ghost:
    'text-navy-800 :var(--color-muted)] hover:bg-navy-900/5 :bg-white/10 border border-transparent',
  outline:
    'border border-navy-900/15  text-[color:var(--color-foreground)] :var(--color-foreground)] hover:border-brand-500/60 hover:text-brand-600 :text-brand-300 bg-transparent',
  glass:
    'bg-[color:var(--color-surface)]  border border-white/40  text-[color:var(--color-foreground)] :var(--color-foreground)] backdrop-blur-xl hover:bg-white/90 :bg-white/[0.14] shadow-[0_8px_32px_rgb(15,23,42,0.12)]',
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
          className="pointer-events-none absolute z-0 rounded-full bg-white/40 "
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
