import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from './Logo';
import { useLandingTheme } from './theme';
import { Button } from './Button';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { label: 'Features', id: 'features' },
  { label: 'Solutions', id: 'solutions' },
  { label: 'Teams', id: 'teams' },
  { label: 'AI', id: 'ai' },
  { label: 'Automation', id: 'automation' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'About', id: 'about' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function PublicNavbar() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useLandingTheme();
  const user = useAuthStore((state) => state.user);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    scrollToSection(id);
  }, []);

  const handleContact = useCallback(() => {
    setMobileOpen(false);
    navigate('/contact');
  }, [navigate]);

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-navy-900/[0.06] bg-white/80 backdrop-blur-xl dark:border-white/[0.08] dark:bg-navy-950/80'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main">
        <Logo to="/" size={32} />

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNav(e, item.id)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-navy-900/[0.04] hover:text-navy-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleContact}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-navy-900/[0.04] hover:text-navy-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            Contact
          </button>
          <a
            href="#docs"
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
            }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-navy-900/[0.04] hover:text-navy-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            aria-disabled="true"
            title="Documentation coming soon"
          >
            Docs
          </a>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy-900/10 bg-white/70 text-slate-600 transition-colors hover:text-navy-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <Button to="/dashboard" size="sm" className="hidden sm:inline-flex">
              Open App <ArrowRight size={16} />
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-navy-900 dark:text-slate-200 dark:hover:text-white sm:inline-flex"
              >
                Login
              </Link>
              <Button to="/register" size="sm" className="hidden sm:inline-flex">
                Get Started
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy-900/10 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 lg:hidden"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-navy-900/[0.06] bg-white/95 backdrop-blur-xl dark:border-white/[0.08] dark:bg-navy-950/95 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-5 py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNav(e, item.id)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-navy-900/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.06]"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={handleContact}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-navy-900/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              Contact
            </button>
            <div className="flex gap-3 pt-3">
              {user ? (
                <Button to="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                  Open App
                </Button>
              ) : (
                <>
                  <Button to="/login" variant="secondary" className="flex-1" onClick={() => setMobileOpen(false)}>
                    Login
                  </Button>
                  <Button to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
