import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Sun, Moon, Menu, Command, LogOut, User, Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useTheme } from '../../hooks/useTheme';
import { popoverVariants } from '../../utils/motion';

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
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass border-b border-border">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden text-[color:var(--color-foreground-secondary)] hover:bg-[color:var(--color-surface-hover)]"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={onCommandPaletteOpen}
          className="hidden sm:flex max-w-md flex-1 items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm text-[color:var(--color-foreground-tertiary)] transition-all hover:border-[color:var(--color-foreground-tertiary)] shadow-xs"
        >
          <Search size={16} />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-background-secondary border border-border text-[color:var(--color-foreground-secondary)]">
            <Command size={10} />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/notifications')}
          className="relative rounded-full p-2 text-[color:var(--color-foreground-secondary)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)] transition-colors"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="rounded-full p-2 text-[color:var(--color-foreground-secondary)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)] transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        <div className="relative pl-2" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 bg-surface hover:border-[color:var(--color-foreground-tertiary)] transition-colors shadow-xs"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-[color:var(--color-foreground)]">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                variants={popoverVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="dropdown absolute right-0 top-[calc(100%+8px)] w-56 transform-origin-top-right"
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
