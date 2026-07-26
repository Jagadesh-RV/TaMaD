import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, CalendarDays, Map, Zap, Target,
  FileText, PenTool, BarChart3, Bell, Settings, User, ChevronLeft,
  ChevronRight, LogOut, Sparkles, TrendingUp, FolderKanban,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';

const sections = [
  {
    label: 'MAIN',
    links: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Tasks', path: '/tasks', icon: CheckSquare },
      { label: 'Calendar', path: '/calendar', icon: CalendarDays },
      { label: 'Projects', path: '/projects', icon: FolderKanban },
      { label: 'Roadmap', path: '/roadmap', icon: Map },
      { label: 'Focus', path: '/focus', icon: Zap },
      { label: 'Planner', path: '/planner', icon: Target },
    ],
  },
  {
    label: 'CREATIVE',
    links: [
      { label: 'Notes', path: '/notes', icon: FileText },
      { label: 'Whiteboard', path: '/whiteboard', icon: PenTool },
    ],
  },
  {
    label: 'ANALYTICS',
    links: [
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      { label: 'Reports', path: '/reports', icon: TrendingUp },
    ],
  },
  {
    label: 'GENERAL',
    links: [
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ collapsed = false, onToggleCollapse, isMobile, isOpen, onClose }: SidebarProps) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const unread = useNotifStore(s => s.unread);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={clsx('flex items-center', collapsed ? 'justify-center px-2' : 'gap-3 px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
          <Sparkles size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-foreground)' }}>TaMaD</p>
            <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>Productivity OS</p>
          </div>
        )}
      </div>

      {/* Workspace */}
      {!collapsed && (
        <div className="mt-5 mb-1 px-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-muted)' }}>Workspace</p>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-foreground)' }}>
            <div className="h-2 w-2 rounded-full" style={{ background: 'var(--color-success)' }} />
            Productivity Hub
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-3 flex-1 overflow-y-auto px-2" style={{ scrollbarWidth: 'thin' }}>
        {sections.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-muted)' }}>
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isNotif = link.path === '/notifications';
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    onClick={isMobile ? onClose : undefined}
                    className={({ isActive }) =>
                      clsx(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                        collapsed && 'justify-center px-2',
                        isActive
                          ? 'nav-link active'
                          : 'nav-link'
                      )
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">{link.label}</span>}
                    {isNotif && unread > 0 && (
                      <span
                        className={clsx(
                          'absolute flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white',
                          collapsed ? 'right-0 top-0.5 translate-x-1/2' : 'right-2'
                        )}
                        style={{ background: 'var(--color-danger)' }}
                      >
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle - desktop only */}
      {!isMobile && onToggleCollapse && (
        <div className="px-2 pb-2">
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-lg p-2 transition-colors"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      )}

      {/* User profile */}
      <div className="mt-auto border-t px-2 pt-3" style={{ borderColor: 'var(--color-border-light)' }}>
        <div className={clsx('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--color-muted)' }}>
                {user?.email || 'user@tamad.io'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-1.5 transition-colors"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.background = 'transparent'; }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
        )}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ width: 260, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between p-4 pb-0">
            <div />
            <button onClick={onClose} className="rounded-lg p-1.5" style={{ color: 'var(--color-muted)' }}>
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pt-2">
            {sidebarContent}
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside
      className={clsx('sidebar transition-all duration-300', collapsed && 'sidebar-collapsed')}
      style={{ width: collapsed ? 68 : 260 }}
    >
      {sidebarContent}
    </aside>
  );
}
