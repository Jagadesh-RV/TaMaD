import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from '../landing/Logo';
import { useLandingTheme } from '../landing/theme';
import { enableLandingScroll } from '../landing/scroll';
import { LogoMark } from '../landing/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  wide?: boolean;
}

const bullets = [
  { title: 'One workspace', text: 'Tasks, docs, meetings, goals — one home.' },
  { title: 'AI with full context', text: 'An assistant that actually knows your work.' },
  { title: 'No more app sprawl', text: 'The full stack, without the stack.' },
];

export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  const { isDark, toggleTheme } = useLandingTheme();

  useEffect(() => {
    enableLandingScroll();
    return () => {
      document.documentElement.classList.remove('landing-scroll');
    };
  }, []);

  return (
    <div className="flex min-h-[100svh] bg-white font-sans text-navy-900 antialiased dark:bg-navy-950 dark:text-white">
      <div className="relative hidden w-[45%] overflow-hidden lg:flex lg:flex-col" style={{ background: 'var(--color-background-secondary)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative flex h-full flex-col p-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" style={{ color: 'var(--color-foreground)' }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <LogoMark size={24} />
              </span>
              <span className="text-lg font-extrabold tracking-tight">TaMaD</span>
            </Link>
          </div>

          <div className="mt-12 flex-1 flex flex-col justify-center">
            <h2 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight" style={{ color: 'var(--color-foreground)' }}>
              A hallmark experience for modern teams.
            </h2>
            <p className="mt-4 max-w-sm text-pretty text-[15px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Experience the new standard in task management. Clean, powerful, and deeply integrated with your workflows.
            </p>

            <div className="mt-12 relative">
               <div className="rounded-xl border shadow-2xl overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                 <img src="/images/hero-dashboard.png" alt="TaMaD App" className="w-full h-auto object-cover rounded-xl" />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between px-5 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-navy-900/[0.05] hover:text-navy-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm font-bold text-navy-900 md:inline-flex dark:text-white">
              <Logo size={24} />
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy-900/10 bg-white/70 text-slate-600 transition-colors hover:text-navy-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div
          className={clsx(
            'flex flex-1 flex-col justify-center px-5 py-10 md:px-8',
            wide ? 'mx-auto w-full max-w-2xl' : 'mx-auto w-full max-w-md',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
