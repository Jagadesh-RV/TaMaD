import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Sun, Moon, Menu, Command, LogOut, User, Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useTheme } from '../../hooks/useTheme';

interface TopBarProps {
  onMenuToggle: () => void;
  onCommandPaletteOpen: () => void;
}

export default function TopBar({ onMenuToggle, onCommandPaletteOpen }: TopBarProps) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const unread = useNotifStore(s => s.unread);
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const timer = window.setTimeout(() => firstMenuItemRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [profileOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="flex items-center justify-between border-b px-4 py-3 lg:px-6"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
          style={{ color: 'var(--color-muted)' }}
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <button
          onClick={onCommandPaletteOpen}
          className="flex max-w-md flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all"
          style={{
            background: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-muted)',
          }}
        >
          <Search size={16} className="shrink-0" />
          <span className="hidden sm:inline">Search tasks, projects...</span>
          <span className="sm:hidden">Search...</span>
          <kbd
            className="ml-auto hidden items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', background: 'var(--color-surface)' }}
          >
            <Command size={10} />K
          </kbd>
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 ml-4">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-lg p-2 transition-colors"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell size={19} />
          {unread > 0 && (
            <span
              className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
              style={{ background: 'var(--color-danger)' }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 transition-colors"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            ref={profileButtonRef}
            onClick={() => setProfileOpen(!profileOpen)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-controls="profile-menu"
            className="flex items-center gap-2 rounded-lg p-1.5 pr-3 transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'var(--color-accent)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span
              className="hidden text-sm font-medium md:block"
              style={{ color: 'var(--color-foreground)' }}
            >
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          {profileOpen && (
            <div
              id="profile-menu"
              role="menu"
              aria-label="Account menu"
              className="dropdown absolute right-0 top-full mt-2 w-56"
              style={{ animation: 'scaleIn 0.15s ease-out' }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  ref={firstMenuItemRef}
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="dropdown-item w-full"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="dropdown-item w-full"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <div className="my-1 border-t" style={{ borderColor: 'var(--color-border-light)' }} />
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="dropdown-item w-full"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
