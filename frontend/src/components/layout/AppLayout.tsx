import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { CommandPalette } from '../ui/CommandPalette';
import { QuickCreate } from '../ui/QuickCreate';
import { Inspector } from '../ui/Inspector';
import { ShortcutsSheet, GNavHud } from '../ui/ShortcutsSheet';
import RouteErrorBoundary from '../ui/RouteErrorBoundary';
import { pageVariants } from '../../utils/motion';
import { useInteractionStore, isTypingTarget } from '../../store/interactionStore';
import { pageLabelFor, iconNameFor } from '../../lib/navigation';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, CheckSquare, FolderKanban, Bell, Plus,
} from 'lucide-react';
import { useNotifStore } from '../../store/notifStore';
import clsx from 'clsx';

const GOTO: Record<string, string> = {
  d: '/dashboard',
  t: '/tasks',
  c: '/calendar',
  p: '/projects',
  r: '/roadmap',
  f: '/focus',
  l: '/planner',
  n: '/notes',
  o: '/documents',
  i: '/files',
  w: '/whiteboard',
  a: '/analytics',
  e: '/reports',
  b: '/ai',
  m: '/team/members',
  s: '/settings',
};

const MOBILE_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/tasks',     icon: CheckSquare,     label: 'Tasks' },
  { path: '/projects',  icon: FolderKanban,    label: 'Projects' },
  { path: '/notifications', icon: Bell,        label: 'Alerts' },
];

function MobileBottomNav() {
  const unread = useNotifStore(s => s.unread);
  const { openQuickCreate } = useInteractionStore();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-2">
        {MOBILE_NAV.slice(0, 2).map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors"
              aria-label={item.label}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-foreground-tertiary)' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-foreground-tertiary)' }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Quick create center button */}
        <button
          onClick={() => openQuickCreate()}
          className="flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            width: 44,
            height: 44,
            background: 'var(--color-accent)',
            boxShadow: '0 2px 8px rgba(59,78,246,0.35)',
          }}
          aria-label="Quick create"
        >
          <Plus size={20} style={{ color: '#fff' }} strokeWidth={2.5} />
        </button>

        {MOBILE_NAV.slice(2).map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const hasNotif = item.path === '/notifications' && unread > 0;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors"
              aria-label={`${item.label}${hasNotif ? ` (${unread} unread)` : ''}`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-foreground-tertiary)' }}
                />
                {hasNotif && (
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: 7,
                      height: 7,
                      top: -1,
                      right: -1,
                      background: 'var(--color-danger)',
                      border: '1.5px solid var(--color-surface)',
                    }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-foreground-tertiary)' }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const gNavKey = useInteractionStore((s) => s.gNavKey);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const label = pageLabelFor(location.pathname);
    if (label === 'Unknown') return;
    useInteractionStore.getState().recordVisit({
      id: `page-${location.pathname}`,
      type: 'page',
      label,
      href: location.pathname,
      icon: iconNameFor(location.pathname),
    });
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      useInteractionStore.getState().openCommandPalette();
      return;
    }
    if (!isTypingTarget(e.target) && !(e.metaKey || e.ctrlKey || e.altKey)) {
      const key = e.key.toLowerCase();
      const st = useInteractionStore.getState();

      if (st.gNavKey === 'g') {
        e.preventDefault();
        if (key === 'g' || key === 'escape') {
          st.setGNavKey(null);
          return;
        }
        st.setGNavKey(null);
        const target = GOTO[key];
        if (target) navigate(target);
        return;
      }
      if (key === 'g') {
        e.preventDefault();
        st.setGNavKey('g');
        return;
      }
      if (key === '/') {
        e.preventDefault();
        st.openCommandPalette();
        return;
      }
      if (key === 'c') {
        st.openQuickCreate();
        return;
      }
      if (key === '?') {
        st.toggleShortcutsSheet();
        return;
      }
    }
    if (e.key === 'Escape') {
      const st = useInteractionStore.getState();
      if (st.shortcutsSheetOpen) st.toggleShortcutsSheet();
      st.closeCommandPalette();
      st.closeQuickCreate();
      if (st.inspector) st.closeInspector();
      st.setGNavKey(null);
      setMobileMenuOpen(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (gNavKey !== 'g') return;
    const timer = window.setTimeout(() => useInteractionStore.getState().setGNavKey(null), 3000);
    return () => window.clearTimeout(timer);
  }, [gNavKey]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="layout">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(p => !p)} />
      </div>

      {/* Mobile sidebar drawer */}
      <div className="lg:hidden">
        <Sidebar
          isMobile
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          onMenuToggle={() => setMobileMenuOpen(true)}
          onCommandPaletteOpen={() => useInteractionStore.getState().openCommandPalette()}
        />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="min-h-full"
            >
              <RouteErrorBoundary>
                <Outlet />
              </RouteErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      <CommandPalette />
      <QuickCreate />
      <Inspector />
      <ShortcutsSheet />
      <GNavHud />
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'shadow-lg font-medium text-sm rounded-2xl',
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)',
            padding: '12px 20px',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-background)',
            },
            style: {
              border: '1px solid var(--color-success-ghost)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-danger)',
              secondary: 'var(--color-background)',
            },
            style: {
              border: '1px solid var(--color-danger-ghost)',
            },
          },
        }}
      />
    </div>
  );
}
