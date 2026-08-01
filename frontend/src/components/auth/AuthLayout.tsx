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
      <div className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <LogoMark size={28} />
              </span>
              <span className="text-lg font-extrabold tracking-tight">TaMaD</span>
            </Link>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Welcome to TaMaD</p>
            <h2 className="mt-4 max-w-md text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white">
              One workspace for work, AI &amp; life.
            </h2>
            <p className="mt-4 max-w-sm text-pretty text-[15px] leading-relaxed text-white/75">
              Join thousands of teams who traded a pile of apps for one beautiful, unified platform.
            </p>

            <ul className="mt-10 space-y-4">
              {bullets.map((bullet) => (
                <li key={bullet.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                      <path d="M2 6.2L4.6 8.8L10 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{bullet.title}</p>
                    <p className="text-[13px] text-white/70">{bullet.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['AN', 'PK', 'MO', 'LR'].map((initials) => (
                <span
                  key={initials}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-600 text-[10px] font-bold text-white"
                  style={{ background: ['#7c3aed', '#10b981', '#f59e0b', '#e11d48'][initials.charCodeAt(0) % 4] }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <p className="text-[13px] leading-snug text-white/70">
              <strong className="font-bold text-white">10,000+ people and teams</strong> organize their universe with TaMaD.
            </p>
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
