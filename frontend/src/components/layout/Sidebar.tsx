import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, CalendarDays, Map, Zap, Target,
  FileText, PenTool, BarChart3, Bell, Settings, ChevronLeft,
  ChevronRight, LogOut, FolderKanban, Users, Brain, HardDrive, Video
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useRealtime } from '../../providers/RealtimeProvider';
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
  const navigate = useNavigate();
  const location = useLocation();

  const isTeam = currentWorkspace?.type === 'team';

  const sections = [
    {
      label: 'MAIN',
      links: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare },
        { label: 'Calendar', path: '/calendar', icon: CalendarDays },
        { label: 'Projects', path: '/projects', icon: FolderKanban },
        { label: 'Roadmap', path: '/roadmap', icon: Map },
        ...(isTeam ? [
          { label: 'Active Sprint', path: '/agile/board', icon: Target },
          { label: 'Backlog', path: '/agile/planning', icon: Map },
        ] : [
          { label: 'Focus', path: '/focus', icon: Zap },
          { label: 'Planner', path: '/planner', icon: Target },
        ]),
      ],
    },
    {
      label: 'CREATIVE',
      links: [
        { label: 'Notes', path: '/notes', icon: FileText },
        { label: 'Documents', path: '/documents', icon: FileText },
        { label: 'Files', path: '/files', icon: HardDrive },
        { label: 'Whiteboard', path: '/whiteboard', icon: PenTool },
      ],
    },
    ...(isTeam ? [{
      label: 'TEAM',
      links: [
        { label: 'Members', path: '/team/members', icon: Users },
        { label: 'Meetings', path: `/team/${currentWorkspace?.teamId}/meetings`, icon: Video },
        { label: 'TaMaD Meet', path: '/team/tamad-meet', icon: Video },
        { label: 'Team Settings', path: '/team/settings', icon: Settings },
      ]
    }] : []),
    {
      label: 'ANALYTICS',
      links: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'AI & TOOLS',
      links: [
        { label: 'AI Assistant', path: '/ai', icon: Brain },
        { label: 'Templates', path: '/templates', icon: FileText },
      ],
    },
  ];

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
      <div className={clsx('flex items-center mt-3', collapsed ? 'justify-center px-2' : 'gap-3 px-4')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
          <span className="font-bold text-lg leading-none">T</span>
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-[color:var(--color-foreground)]">TaMaD</p>
          </motion.div>
        )}
      </div>

      {!collapsed && (
        <div className="mt-6 mb-2 px-4">
          <WorkspaceSwitcher />
        </div>
      )}

      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: 'none' }}>
        {sections.map((section, idx) => (
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

      <div className="px-4 pb-4">
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-md p-2 hover:bg-[color:var(--color-surface-hover)] text-[color:var(--color-foreground-tertiary)] transition-colors mb-2"
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
                <p className="text-[10px] text-[color:var(--color-foreground-tertiary)]">Online</p>
              </div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-[color:var(--color-foreground-tertiary)] hover:text-danger transition-colors p-1 rounded-md hover:bg-danger-light">
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
                <button ref={closeButtonRef} onClick={onClose} className="rounded-lg p-1.5 text-[color:var(--color-muted)]">
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
      className="h-screen shrink-0 bg-background-secondary border-r border-border flex flex-col overflow-hidden"
    >
      {sidebarContent}
    </motion.aside>
  );
}
