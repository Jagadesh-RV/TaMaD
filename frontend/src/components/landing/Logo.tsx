import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  to?: string;
}

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={clsx('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/tamadmainlogo-removebg-preview.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}

export function Logo({ className, showWordmark = true, size = 34, to = '/' }: LogoProps) {
  return (
    <Link
      to={to}
      aria-label="TaMaD — back to home"
      className={clsx('group inline-flex items-center gap-2.5 rounded-xl', className)}
    >
      <LogoMark size={size} className="transition-transform duration-300 group-hover:scale-[1.04]" />
      {showWordmark && (
        <span className="text-[1.15rem] font-extrabold tracking-tight text-foreground dark:text-white">
          TaMaD
        </span>
      )}
    </Link>
  );
}
