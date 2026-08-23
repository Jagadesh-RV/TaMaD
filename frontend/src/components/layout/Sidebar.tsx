import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, LogOut,
  Pin, Star, User, Building2, X, Bell, Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useRealtime } from '../../providers/RealtimeProvider';
import { useInteractionStore } from '../../store/interactionStore';
import { pageLabelFor, pageIconFor, iconForName } from '../../lib/navigation';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { useWorkspaceStore } from '../../store/workspaceStore';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  badge?: number;
  onPinToggle?: (href: string) => void;
  isPinned?: boolean;
  showPin?: boolean;
}

function NavItem({
  path,
  icon: Icon,
  label,
  collapsed,
  isMobile,
  onClose,
  badge,
  onPinToggle,
  isPinned,
  showPin,
}: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path || 
    (path !== '/' && location.pathname.startsWith(path + '/'));

  return (
    <div className="group relative flex items-center">
      <NavLink
        to={path}
        onClick={isMobile ? onClose : undefined}
        title={collapsed ? label : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={clsx(
          'relative z-10 flex flex-1 items-center gap-2.5 rounded-md transition-all',
          collapsed
            ? 'justify-center w-10 h-9 mx-auto'
            : 'py-1.5 pl-2.5 pr-8',
          isActive
            ? 'text-[color:var(--color-accent)]'
            : 'text-[color:var(--color-foreground-secondary)] hover:text-[color:var(--color-foreground)]'
        )}
      >
        {/* Active background */}
        {isActive && (
          <motion.span
            layoutId="sidebar-active-bg"
            className="absolute inset-0 rounded-md"
            style={{ background: 'var(--color-accent-ghost)' }}
            initial={false}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          />
        )}
        {/* Active indicator bar */}
        {isActive && (
          <motion.span
            layoutId="sidebar-active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
            style={{ width: 2.5, height: 16, background: 'var(--color-accent)' }}
            initial={false}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          />
        )}

        <Icon
          size={16}
          className="relative z-10 shrink-0"
          strokeWidth={isActive ? 2.5 : 2}
        />
        {!collapsed && (
          <span className="relative z-10 truncate text-[13px] font-medium leading-none">
            {label}
          </span>
        )}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span
            className="relative z-10 ml-auto flex items-center justify-center rounded-full text-[10px] font-bold leading-none"
            style={{
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              background: 'var(--color-danger)',
              color: '#fff',
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {!collapsed && badge === 0 && null}
      </NavLink>

      {/* Pin button — appears on hover */}
      {!collapsed && showPin && (
        <button
          onClick={() => onPinToggle?.(path)}
          className={clsx(
            'absolute right-1 z-20 rounded-md p-1 transition-all',
            isPinned
              ? 'text-[color:var(--color-accent)] opacity-100'
              : 'text-[color:var(--color-muted)] opacity-0 group-hover:opacity-100',
            'hover:bg-[color:var(--color-surface-active)]'
          )}
          aria-label={isPinned ? `Unpin ${label}` : `Pin ${label}`}
        >
          <Star size={11} fill={isPinned ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-2 h-px mx-2" style={{ background: 'var(--color-border-light)' }} />;
  return (
    <p className="mb-1 mt-4 px-2.5 text-[10px] font-semibold tracking-wider"
      style={{ color: 'var(--color-foreground-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {label}
    </p>
  );
}

export default function Sidebar({ collapsed = false, onToggleCollapse, isMobile, isOpen, onClose }: SidebarProps) {
  const user = useAuthStore(s => s.user);
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const logout = useAuthStore(s => s.logout);
  const unread = useNotifStore(s => s.unread);
  const { onlineUsers } = useRealtime();
  const pinned = useInteractionStore(s => s.pinned);
  const recents = useInteractionStore(s => s.recents);
  const togglePin = useInteractionStore(s => s.togglePin);
  const navigate = useNavigate();
  const location = useLocation();

  const isTeam = currentWorkspace?.type === 'team';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isMobile && isOpen) {
      const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
  }, [isMobile, isOpen]);

  // Navigation sections
  const personalSections = [
    {
      label: undefined,
      links: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'My Tasks', path: '/tasks' },
        { label: 'Projects', path: '/projects' },
        { label: 'Calendar', path: '/calendar' },
        { label: 'Planner', path: '/planner' },
      ],
    },
    {
      label: 'Personal',
      links: [
        { label: 'Focus', path: '/focus' },
        { label: 'Roadmap', path: '/roadmap' },
      ],
    },
    {
      label: 'Knowledge',
      links: [
        { label: 'Notes', path: '/notes' },
        { label: 'Documents', path: '/documents' },
        { label: 'Files', path: '/files' },
        { label: 'Whiteboard', path: '/whiteboard' },
      ],
    },
    {
      label: 'Insights',
      links: [
        { label: 'Analytics', path: '/analytics' },
        { label: 'Reports', path: '/reports' },
      ],
    },
    {
      label: 'Tools',
      links: [
        { label: 'AI Assistant', path: '/ai' },
        { label: 'Templates', path: '/templates' },
      ],
    },
  ];

  const teamSections = [
    {
      label: undefined,
      links: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Tasks', path: '/tasks' },
        { label: 'Projects', path: '/projects' },
        { label: 'Calendar', path: '/calendar' },
        { label: 'Roadmap', path: '/roadmap' },
      ],
    },
    {
      label: 'Agile',
      links: [
        { label: 'Active Sprint', path: '/agile/board' },
        { label: 'Backlog', path: '/agile/planning' },
      ],
    },
    {
      label: 'Collaborate',
      links: [
        { label: 'Notes', path: '/notes' },
        { label: 'Documents', path: '/documents' },
        { label: 'Files', path: '/files' },
        { label: 'Whiteboard', path: '/whiteboard' },
      ],
    },
    {
      label: 'Team',
      links: [
        { label: 'Members', path: '/team/members' },
        { label: 'Meetings', path: currentWorkspace?.teamId ? `/team/${currentWorkspace.teamId}/meetings` : '/team/tamad-meet' },
        { label: 'TaMaD Meet', path: '/team/tamad-meet' },
        { label: 'Team Settings', path: '/team/settings' },
      ],
    },
    {
      label: 'Insights',
      links: [
        { label: 'Analytics', path: '/analytics' },
        { label: 'Reports', path: '/reports' },
      ],
    },
    {
      label: 'Tools',
      links: [
        { label: 'AI Assistant', path: '/ai' },
        { label: 'Templates', path: '/templates' },
      ],
    },
  ];

  const sections = isTeam ? teamSections : personalSections;

  // User initials
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const sidebarContent = (
    <div className="flex h-full flex-col" style={{ minHeight: 0 }}>

      {/* Brand + Workspace mode */}
      <div className={clsx(
        'flex items-center border-b shrink-0',
        collapsed ? 'justify-center py-3 px-2' : 'gap-2.5 px-4 py-3',
      )}
        style={{ borderColor: 'var(--color-border-light)', minHeight: 52 }}
      >
        {/* Logo mark */}
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden"
          style={{ width: 30, height: 30 }}
        >
          <img
            src="/logo/tamad-favicon-ink.svg"
            alt="TaMaD"
            className="h-full w-full object-contain"
          />
        </div>

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0 flex-1"
          >
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold tracking-tight"
                style={{ color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
                TaMaD
              </p>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{
                  background: isTeam ? 'var(--color-success-ghost)' : 'var(--color-accent-ghost)',
                  color: isTeam ? 'var(--color-success)' : 'var(--color-accent)',
                  letterSpacing: '0.04em',
                }}
              >
                {isTeam ? (
                  <><Building2 size={8} />{currentWorkspace?.name?.slice(0, 12) || 'Team'}</>
                ) : (
                  <><User size={8} />Personal</>
                )}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Workspace Switcher */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <WorkspaceSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-2 pt-2 pb-3"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Main navigation"
      >
        {/* Pinned items */}
        {!collapsed && pinned.length > 0 && (
          <div className="mb-4">
            <p className="mb-1 px-2.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider"
              style={{ color: 'var(--color-foreground-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              <Pin size={9} />Pinned
            </p>
            <div className="space-y-0.5">
              {pinned.map((href) => {
                const Icon = pageIconFor(href);
                const label = pageLabelFor(href);
                const isPinned = true;
                return (
                  <NavItem
                    key={href}
                    path={href}
                    icon={Icon}
                    label={label}
                    collapsed={false}
                    isMobile={isMobile}
                    onClose={onClose}
                    onPinToggle={togglePin}
                    isPinned={isPinned}
                    showPin
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recent items */}
        {!collapsed && recents.length > 0 && pinned.length === 0 && (
          <div className="mb-4">
            <p className="mb-1 px-2.5 text-[10px] font-semibold tracking-wider"
              style={{ color: 'var(--color-foreground-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Recent
            </p>
            <div className="space-y-0.5">
              {recents.slice(0, 3).map((r) => {
                const Icon = iconForName(r.icon);
                const isPinned = pinned.includes(r.href);
                return (
                  <NavItem
                    key={r.id}
                    path={r.href}
                    icon={Icon}
                    label={r.label}
                    collapsed={false}
                    isMobile={isMobile}
                    onClose={onClose}
                    onPinToggle={togglePin}
                    isPinned={isPinned}
                    showPin
                  />
                );
              })}
            </div>
            <div className="my-3 mx-2.5 h-px" style={{ background: 'var(--color-border-light)' }} />
          </div>
        )}

        {/* Main nav sections */}
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className={clsx(collapsed && 'flex flex-col items-center')}>
            {section.label && <SectionLabel label={section.label} collapsed={collapsed} />}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = pageIconFor(link.path);
                const isPinnedLink = pinned.includes(link.path);
                return (
                  <NavItem
                    key={link.label + link.path}
                    path={link.path}
                    icon={Icon}
                    label={link.label}
                    collapsed={collapsed}
                    isMobile={isMobile}
                    onClose={onClose}
                    badge={link.path === '/notifications' ? unread : undefined}
                    onPinToggle={togglePin}
                    isPinned={isPinnedLink}
                    showPin={!collapsed}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: User card + controls */}
      <div className="px-2 pb-3 pt-2 shrink-0 space-y-1" style={{ borderTop: '1px solid var(--color-border-light)' }}>
        {/* Collapse toggle (desktop only) */}
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-md py-1.5 transition-colors"
            style={{ color: 'var(--color-foreground-tertiary)' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-medium">
                <ChevronLeft size={14} />Collapse
              </span>
            )}
          </button>
        )}

        {/* User card */}
        <div
          className={clsx(
            'flex items-center gap-2.5 rounded-lg p-2 transition-colors cursor-default',
            collapsed ? 'justify-center' : '',
          )}
          style={{ background: 'var(--color-surface-active)' }}
        >
          {/* Avatar */}
          <div
            className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{
              width: 28,
              height: 28,
              background: 'var(--color-accent)',
              position: 'relative',
            }}
          >
            {userInitials}
            {/* Online indicator */}
            <span
              className="absolute"
              style={{
                width: 7,
                height: 7,
                background: 'var(--color-success)',
                border: '1.5px solid var(--color-surface-active)',
                borderRadius: '50%',
                bottom: -1,
                right: -1,
              }}
            />
          </div>

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold leading-none mb-0.5"
                  style={{ color: 'var(--color-foreground)' }}>
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] leading-none"
                  style={{ color: 'var(--color-foreground-tertiary)' }}>
                  {onlineUsers.length > 0
                    ? `${onlineUsers.length} online`
                    : '1 online'}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => navigate('/notifications')}
                  className="relative rounded-md p-1.5 transition-colors"
                  style={{ color: 'var(--color-foreground-tertiary)' }}
                  aria-label="Notifications"
                >
                  <Bell size={13} />
                  {unread > 0 && (
                    <span className="notification-dot" style={{ width: 6, height: 6, top: 2, right: 2 }} />
                  )}
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="rounded-md p-1.5 transition-colors"
                  style={{ color: 'var(--color-foreground-tertiary)' }}
                  aria-label="Settings"
                >
                  <Settings size={13} />
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-md p-1.5 transition-colors"
                  style={{ color: 'var(--color-foreground-tertiary)' }}
                  aria-label="Sign out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
              onClick={onClose}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col"
              style={{
                width: 256,
                background: 'var(--color-background)',
                borderRight: '1px solid var(--color-border)',
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-end p-2 shrink-0">
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="rounded-lg p-1.5 transition-colors"
                  style={{ color: 'var(--color-foreground-tertiary)' }}
                  aria-label="Close navigation"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 420, damping: 40 }}
      className="h-screen shrink-0 flex flex-col overflow-hidden"
      style={{
        background: 'var(--color-background)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {sidebarContent}
    </motion.aside>
  );
}
