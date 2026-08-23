import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from './Logo';
import { useLandingTheme } from './theme';
import { Button } from './Button';
import { scrollToSection } from './scrollTo';
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
          ? 'border-b border-border bg-[color:var(--color-background)]/80 backdrop-blur-xl  :var(--color-background)]/80'
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
              className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)] :var(--color-muted)] :bg-[color:var(--color-surface-hover)] :text-[color:var(--color-foreground)]"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleContact}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)] :var(--color-muted)] :bg-[color:var(--color-surface-hover)] :text-[color:var(--color-foreground)]"
          >
            Contact
          </button>
          <a
            href="#docs"
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
            }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)] :var(--color-muted)] :bg-[color:var(--color-surface-hover)] :text-[color:var(--color-foreground)]"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-[color:var(--color-surface)] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)]  :var(--color-surface)] :var(--color-muted)] :text-[color:var(--color-foreground)]"
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
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:text-[color:var(--color-foreground)] :var(--color-muted)] :text-[color:var(--color-foreground)] sm:inline-flex"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-[color:var(--color-surface)] text-[color:var(--color-foreground)]  :var(--color-surface)] :var(--color-muted)] lg:hidden"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-[color:var(--color-background)]/95 backdrop-blur-xl  :var(--color-background)]/95 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-5 py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNav(e, item.id)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-hover)] :var(--color-muted)] :bg-[color:var(--color-surface-hover)]"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={handleContact}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-hover)] :var(--color-muted)] :bg-[color:var(--color-surface-hover)]"
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
