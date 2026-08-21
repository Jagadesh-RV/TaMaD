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
import { pageLabelFor } from '../../lib/navigation';

interface TopBarProps {
  onMenuToggle: () => void;
  onCommandPaletteOpen: () => void;
}

function Breadcrumbs() {
  const location = useLocation();
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const isTeam = currentWorkspace?.type === 'team';

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; path: string }[] = [];

    // Workspace context as root
    if (isTeam && currentWorkspace) {
      crumbs.push({ label: currentWorkspace.name, path: '/dashboard' });
    }

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = pageLabelFor(currentPath);
      if (label !== 'Unknown') {
        crumbs.push({ label, path: currentPath });
      }
    }

    return crumbs;
  }, [location.pathname, isTeam, currentWorkspace]);

  if (breadcrumbs.length <= 1) {
    // Just show the current page name
    const currentLabel = pageLabelFor(location.pathname);
    if (currentLabel === 'Unknown') return null;
    return (
      <span className="hidden sm:block text-[13px] font-semibold"
        style={{ color: 'var(--color-foreground)', letterSpacing: '-0.01em' }}>
        {currentLabel}
      </span>
    );
  }

  return (
    <nav className="hidden sm:flex items-center gap-0.5" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center gap-0.5">
          {index > 0 && (
            <ChevronRight size={12} style={{ color: 'var(--color-foreground-tertiary)' }} />
          )}
          <span
            className={clsx(
              'text-[13px] font-medium',
              index === breadcrumbs.length - 1
                ? 'font-semibold'
                : ''
            )}
            style={{
              color: index === breadcrumbs.length - 1
                ? 'var(--color-foreground)'
                : 'var(--color-foreground-tertiary)'
            }}
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

  // User initials
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3"
      style={{
        padding: '0 20px',
        height: 'var(--header-height, 52px)',
        background: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile menu */}
        <button
          onClick={onMenuToggle}
          className="flex lg:hidden items-center justify-center rounded-md transition-colors"
          style={{ width: 34, height: 34, color: 'var(--color-foreground-secondary)' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumbs / Page title */}
        <Breadcrumbs />
      </div>

      {/* Center: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-auto justify-center">
        <button
          onClick={onCommandPaletteOpen}
          id="topbar-search-btn"
          className="group flex w-full max-w-[320px] items-center gap-2 rounded-lg transition-all"
          style={{
            background: 'var(--color-surface-hover)',
            border: '1px solid var(--color-border)',
            padding: '5px 8px 5px 12px',
            color: 'var(--color-foreground-tertiary)',
            boxShadow: 'var(--shadow-xs)',
          }}
          aria-label="Search (Ctrl+K)"
        >
          <Search size={14} className="group-hover:text-[color:var(--color-foreground-secondary)] transition-colors" />
          <span className="flex-1 text-left text-[13px] group-hover:text-[color:var(--color-foreground-secondary)] transition-colors">Search or jump to...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded text-[10px] font-medium"
            style={{
              padding: '2px 5px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-foreground-secondary)',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}>
            <Command size={9} />K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Connection status — minimal */}
        <div
          className="hidden lg:flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium transition-colors"
          style={{
            background: isConnected ? 'transparent' : 'var(--color-warning-ghost)',
            color: isConnected ? 'var(--color-foreground-tertiary)' : 'var(--color-warning)',
          }}
          title={isConnected ? 'Connected' : 'Reconnecting...'}
        >
          <span
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: isConnected ? 'var(--color-success)' : 'var(--color-warning)',
              boxShadow: isConnected ? '0 0 0 2px var(--color-success-ghost)' : '0 0 0 2px var(--color-warning-ghost)',
            }}
          />
          {isConnected ? 'Syncing...' : 'Disconnected'}
        </div>

        {/* Mobile search */}
        <button
          onClick={onCommandPaletteOpen}
          className="md:hidden flex items-center justify-center rounded-md transition-colors"
          style={{ width: 34, height: 34, color: 'var(--color-foreground-secondary)' }}
          aria-label="Search"
        >
          <Search size={16} />
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative flex items-center justify-center rounded-md transition-colors"
          style={{ width: 34, height: 34, color: 'var(--color-foreground-secondary)' }}
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span
              className="absolute rounded-full"
              style={{
                width: 7,
                height: 7,
                top: 5,
                right: 5,
                background: 'var(--color-danger)',
                border: '1.5px solid var(--color-background)',
              }}
            />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-md transition-colors"
          style={{ width: 34, height: 34, color: 'var(--color-foreground-secondary)' }}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 rounded-full border transition-all hover:bg-[color:var(--color-surface-hover)]"
            style={{
              padding: '2px 8px 2px 2px',
              background: 'var(--color-surface)',
              borderColor: profileOpen ? 'var(--color-foreground-tertiary)' : 'var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
            }}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Profile menu"
          >
            <div
              className="flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
              style={{ width: 26, height: 26, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}
              aria-hidden="true"
            >
              {userInitials}
            </div>
            <span className="hidden sm:block text-[12px] font-medium"
              style={{ color: 'var(--color-foreground)' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="dropdown absolute right-0"
                style={{ top: 'calc(100% + 6px)', minWidth: 220 }}
              >
                {/* User info */}
                <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
                    {user?.name}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--color-foreground-tertiary)' }}>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="dropdown-item w-full"
                >
                  <User size={14} style={{ color: 'var(--color-foreground-secondary)' }} />
                  Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="dropdown-item w-full"
                >
                  <Settings size={14} style={{ color: 'var(--color-foreground-secondary)' }} />
                  Settings
                </button>
                <div className="dropdown-separator" />
                <button
                  onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }}
                  className="dropdown-item dropdown-item-danger w-full"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
