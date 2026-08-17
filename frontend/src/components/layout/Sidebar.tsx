import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, CalendarDays, Map, Zap, Target,
  FileText, PenTool, BarChart3, Settings, ChevronLeft,
  ChevronRight, LogOut, FolderKanban, Users, Brain, HardDrive, Video,
  Pin, Clock, Star, Briefcase, User, Building2, Rocket,
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

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
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

  const personalSections = [
    {
      label: 'WORKSPACE',
      links: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare },
        { label: 'Calendar', path: '/calendar', icon: CalendarDays },
        { label: 'Projects', path: '/projects', icon: FolderKanban },
        { label: 'Roadmap', path: '/roadmap', icon: Map },
        { label: 'Focus', path: '/focus', icon: Zap },
        { label: 'Planner', path: '/planner', icon: Target },
      ],
    },
    {
      label: 'CREATE',
      links: [
        { label: 'Notes', path: '/notes', icon: FileText },
        { label: 'Documents', path: '/documents', icon: FileText },
        { label: 'Files', path: '/files', icon: HardDrive },
        { label: 'Whiteboard', path: '/whiteboard', icon: PenTool },
      ],
    },
    {
      label: 'INSIGHTS',
      links: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'TOOLS',
      links: [
        { label: 'AI Assistant', path: '/ai', icon: Brain },
        { label: 'Templates', path: '/templates', icon: FileText },
      ],
    },
  ];

  const teamSections = [
    {
      label: 'OVERVIEW',
      links: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare },
        { label: 'Calendar', path: '/calendar', icon: CalendarDays },
        { label: 'Projects', path: '/projects', icon: FolderKanban },
        { label: 'Roadmap', path: '/roadmap', icon: Map },
      ],
    },
    {
      label: 'AGILE',
      links: [
        { label: 'Active Sprint', path: '/agile/board', icon: Rocket },
        { label: 'Backlog', path: '/agile/planning', icon: Target },
      ],
    },
    {
      label: 'COLLABORATE',
      links: [
        { label: 'Notes', path: '/notes', icon: FileText },
        { label: 'Documents', path: '/documents', icon: FileText },
        { label: 'Files', path: '/files', icon: HardDrive },
        { label: 'Whiteboard', path: '/whiteboard', icon: PenTool },
      ],
    },
    {
      label: 'TEAM',
      links: [
        { label: 'Members', path: '/team/members', icon: Users },
        { label: 'Meetings', path: `/team/${currentWorkspace?.teamId}/meetings`, icon: Video },
        { label: 'TaMaD Meet', path: '/team/tamad-meet', icon: Video },
        { label: 'Settings', path: '/team/settings', icon: Settings },
      ],
    },
    {
      label: 'ANALYTICS',
      links: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'TOOLS',
      links: [
        { label: 'AI Assistant', path: '/ai', icon: Brain },
        { label: 'Templates', path: '/templates', icon: FileText },
      ],
    },
  ];

  const sections = isTeam ? teamSections : personalSections;

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

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo + Workspace Type Indicator */}
      <div className={clsx('flex items-center mt-3', collapsed ? 'justify-center px-2' : 'gap-3 px-4')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
          <span className="font-bold text-lg leading-none">T</span>
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight text-[color:var(--color-foreground)]">TaMaD</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isTeam ? (
                <>
                  <Building2 size={10} className="text-[color:var(--color-success)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-success)]">Team</span>
                </>
              ) : (
                <>
                  <User size={10} className="text-[color:var(--color-accent)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">Personal</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Workspace Switcher */}
      {!collapsed && (
        <div className="mt-4 mb-2 px-4">
          <WorkspaceSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: 'none' }}>
        {/* Pinned & Recent */}
        {!collapsed && (pinned.length > 0 || recents.length > 0) && (
          <div className="mb-5 space-y-5">
            {pinned.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-foreground-tertiary)]">
                  <Pin size={10} /> Pinned
                </p>
                <div className="space-y-0.5">
                  {pinned.map((href) => {
                    const Icon = pageIconFor(href);
                    const label = pageLabelFor(href);
                    const isActive = location.pathname === href;
                    return (
                      <div key={href} className="group relative flex items-center">
                        <NavLink
                          to={href}
                          onClick={isMobile ? onClose : undefined}
                          className={clsx(
                            'relative z-10 flex flex-1 items-center gap-3 rounded-md py-2 pl-3 pr-8 transition-colors',
                            isActive ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-foreground-secondary)] hover:text-[color:var(--color-foreground)]'
                          )}
                        >
                          {isActive && (
                            <span className="absolute inset-0 rounded-md bg-[color:var(--color-accent-ghost)]" />
                          )}
                          <Icon size={17} className="relative z-10 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                          <span className="relative z-10 truncate text-[13px] font-medium">{label}</span>
                        </NavLink>
                        <button
                          onClick={() => togglePin(href)}
                          className="absolute right-1.5 z-20 rounded-md p-1 text-[color:var(--color-accent)] opacity-0 transition-opacity hover:bg-[color:var(--color-surface-active)] group-hover:opacity-100"
                          aria-label="Unpin"
                        >
                          <Star size={12} fill="currentColor" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {recents.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-foreground-tertiary)]">
                  <Clock size={10} /> Recent
                </p>
                <div className="space-y-0.5">
                  {recents.slice(0, 4).map((r) => {
                    const Icon = iconForName(r.icon);
                    const isActive = location.pathname === r.href;
                    const isPinned = pinned.includes(r.href);
                    return (
                      <div key={r.id} className="group relative flex items-center">
                        <NavLink
                          to={r.href}
                          onClick={isMobile ? onClose : undefined}
                          className={clsx(
                            'relative z-10 flex flex-1 items-center gap-3 rounded-md py-2 pl-3 pr-8 transition-colors',
                            isActive ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-foreground-secondary)] hover:text-[color:var(--color-foreground)]'
                          )}
                        >
                          {isActive && (
                            <span className="absolute inset-0 rounded-md bg-[color:var(--color-accent-ghost)]" />
                          )}
                          <Icon size={17} className="relative z-10 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                          <span className="relative z-10 truncate text-[13px] font-medium">{r.label}</span>
                        </NavLink>
                        <button
                          onClick={() => togglePin(r.href)}
                          className={clsx(
                            'absolute right-1.5 z-20 rounded-md p-1 transition-opacity hover:bg-[color:var(--color-surface-active)]',
                            isPinned ? 'text-[color:var(--color-accent)] opacity-100' : 'text-[color:var(--color-muted)] opacity-0 group-hover:opacity-100'
                          )}
                          aria-label={isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Star size={12} fill={isPinned ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Sections */}
        {sections.map((section) => (
          <div key={section.label} className={clsx("mb-4", collapsed && "flex flex-col items-center")}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold text-[color:var(--color-foreground-tertiary)] tracking-wider">
                {section.label}
              </p>
            )}
            <div className="space-y-1 relative">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/dashboard');
                
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={isMobile ? onClose : undefined}
                    className={clsx(
                      'group relative flex items-center gap-3 rounded-md py-2 transition-colors z-10',
                      collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-3',
                      isActive ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-foreground-secondary)] hover:text-[color:var(--color-foreground)]'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bg"
                        className="absolute inset-0 bg-[color:var(--color-accent-ghost)] rounded-md z-0"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[color:var(--color-accent)] z-0"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon size={18} className="shrink-0 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                    {!collapsed && (
                      <span className="truncate text-[13px] font-medium relative z-10">{link.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Controls */}
      <div className="px-4 pb-4">
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-md p-2 hover:bg-[color:var(--color-surface-hover)] text-[color:var(--color-foreground-tertiary)] transition-colors mb-2"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        
        <div className={clsx("flex items-center gap-3 rounded-xl border border-border p-3 bg-surface", collapsed && "justify-center px-0")}>
          <div className="avatar avatar-sm shrink-0 bg-accent text-white font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[color:var(--color-foreground)]">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                </span>
                <p className="text-[10px] text-[color:var(--color-foreground-tertiary)]">
                  {onlineUsers.length > 0 ? `${onlineUsers.length + 1} online now` : 'Online'}
                </p>
              </div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-[color:var(--color-foreground-tertiary)] hover:text-danger transition-colors p-1 rounded-md hover:bg-danger-light" aria-label="Sign out">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-surface border-r border-border"
            >
              <div className="flex items-center justify-between p-4 pb-0">
                <div />
                <button ref={closeButtonRef} onClick={onClose} className="rounded-lg p-1.5 text-[color:var(--color-muted)]" aria-label="Close sidebar">
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-2">{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="h-screen shrink-0 bg-background-secondary/70 backdrop-blur-2xl border-r border-border flex flex-col overflow-hidden"
    >
      {sidebarContent}
    </motion.aside>
  );
}
