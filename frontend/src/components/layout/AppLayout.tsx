import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { CommandPalette } from '../ui/CommandPalette';
import { QuickCreate } from '../ui/QuickCreate';
import { Inspector } from '../ui/Inspector';
import { ShortcutsSheet, GNavHud } from '../ui/ShortcutsSheet';
import { pageVariants } from '../../utils/motion';
import { useInteractionStore, isTypingTarget } from '../../store/interactionStore';
import { pageLabelFor, iconNameFor } from '../../lib/navigation';
import { Toaster } from 'react-hot-toast';

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

      {/* Mobile sidebar */}
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
          {/* Cinematic page choreography — every journey reveals itself */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

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
