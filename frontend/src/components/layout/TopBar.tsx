import { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, Sun, Moon, Menu, Command, LogOut, User, Settings,
  Wifi, WifiOff, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useTheme } from '../../hooks/useTheme';
import { useRealtime } from '../../providers/RealtimeProvider';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useInteractionStore } from '../../store/interactionStore';
import { pageLabelFor } from '../../lib/navigation';

interface TopBarProps {
  onMenuToggle: () => void;
  onCommandPaletteOpen: () => void;
}

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function Breadcrumbs() {
  const location = useLocation();
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const isTeam = currentWorkspace?.type === 'team';

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; path: string }[] = [];

    // Add workspace context for team mode
    if (isTeam && currentWorkspace) {
      crumbs.push({
        label: currentWorkspace.name,
        path: '/dashboard',
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = pageLabelFor(currentPath);
      if (label !== 'Unknown') {
        crumbs.push({
          label,
          path: currentPath,
        });
      }
    });

    return crumbs;
  }, [location.pathname, isTeam, currentWorkspace]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="hidden md:flex items-center gap-1 text-xs" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={12} className="text-[color:var(--color-foreground-tertiary)]" />}
          <span
            className={clsx(
              'font-medium',
              index === breadcrumbs.length - 1
                ? 'text-[color:var(--color-foreground)]'
                : 'text-[color:var(--color-foreground-tertiary)]'
            )}
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default function TopBar({ onMenuToggle, onCommandPaletteOpen }: TopBarProps) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const unread = useNotifStore(s => s.unread);
  const { theme, toggleTheme, isDark } = useTheme();
  const { isConnected } = useRealtime();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const now = useLiveClock();

  useEffect(() => {
    if (!profileOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden text-[color:var(--color-foreground-secondary)] hover:bg-[color:var(--color-surface-hover)]"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Live clock */}
        <div className="hidden md:flex items-center gap-2.5 min-w-0 ml-auto">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-success)] opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-success)]" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tabular-nums tracking-tight text-[color:var(--color-foreground)]">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
              {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Search */}
        <button
          onClick={onCommandPaletteOpen}
          className="hidden sm:flex max-w-md flex-1 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-[color:var(--color-foreground-tertiary)] transition-all hover:border-[color:var(--color-foreground-tertiary)]"
        >
          <Search size={16} />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-background-secondary border border-border text-[color:var(--color-foreground-secondary)]">
            <Command size={10} />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Connection status */}
        <div
          className="hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-border bg-surface text-[11px] font-bold"
          title={isConnected ? 'Live workspace' : 'Reconnecting...'}
        >
          {isConnected ? (
            <Wifi size={13} className="text-[color:var(--color-success)]" />
          ) : (
            <WifiOff size={13} className="text-warning animate-pulse" />
          )}
          <span className={isConnected ? 'text-[color:var(--color-foreground-secondary)]' : 'text-warning'}>
            {isConnected ? 'Live' : 'Syncing'}
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-lg p-2 text-[color:var(--color-foreground-secondary)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)] transition-colors"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-[color:var(--color-foreground-secondary)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)] transition-colors"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile dropdown */}
        <div className="relative pl-2" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg border border-border p-1 pr-3 bg-surface hover:border-[color:var(--color-foreground-tertiary)] transition-colors"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-[color:var(--color-foreground)]">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="dropdown absolute right-0 top-[calc(100%+8px)] w-56"
              >
                <div className="px-4 py-3 border-b border-border-light mb-1">
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)] truncate">{user?.name}</p>
                  <p className="text-xs text-[color:var(--color-foreground-tertiary)] truncate mt-0.5">{user?.email}</p>
                </div>
                <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} className="dropdown-item w-full">
                  <User size={15} className="text-[color:var(--color-foreground-secondary)]" /> Profile
                </button>
                <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="dropdown-item w-full">
                  <Settings size={15} className="text-[color:var(--color-foreground-secondary)]" /> Settings
                </button>
                <div className="my-1 border-t border-border-light" />
                <button onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }} className="dropdown-item w-full text-danger hover:bg-danger-light/50">
                  <LogOut size={15} /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
