import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertOctagon,
  Inbox,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useNotifStore } from '../store/notifStore';

type FilterTab = 'all' | 'unread' | 'mentions' | 'assignments';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'assignments', label: 'Assignments' },
];

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  warning: { icon: AlertTriangle, color: 'var(--color-warning)', bg: 'var(--color-warning-light)', label: 'Warning' },
  info: { icon: Info, color: 'var(--color-info)', bg: 'var(--color-info-light)', label: 'Info' },
  success: { icon: CheckCircle, color: 'var(--color-success)', bg: 'var(--color-success-light)', label: 'Success' },
  danger: { icon: AlertOctagon, color: 'var(--color-danger)', bg: 'var(--color-danger-light)', label: 'Danger' },
  task_assigned: { icon: Bell, color: 'var(--color-accent)', bg: 'var(--color-accent-light)', label: 'Assignment' },
  task_updated: { icon: Info, color: 'var(--color-info)', bg: 'var(--color-info-light)', label: 'Update' },
  mention: { icon: AlertTriangle, color: 'var(--color-warning)', bg: 'var(--color-warning-light)', label: 'Mention' },
  comment: { icon: Info, color: 'var(--color-info)', bg: 'var(--color-info-light)', label: 'Comment' },
  reminder: { icon: AlertOctagon, color: 'var(--color-danger)', bg: 'var(--color-danger-light)', label: 'Reminder' },
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { notifications, unread, loading, fetchNotifications, markRead, markAllRead, deleteNotification } = useNotifStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = useCallback((id: string) => {
    void markRead(id);
  }, [markRead]);

  const handleMarkAllRead = useCallback(() => {
    void markAllRead();
  }, [markAllRead]);

  const handleDelete = useCallback((id: string) => {
    void deleteNotification(id);
  }, [deleteNotification]);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'mentions':
        return notifications.filter(
          (n) =>
            n.type === 'mention' ||
            n.title?.toLowerCase().includes('comment') ||
            n.body?.toLowerCase().includes('commented') ||
            n.body?.toLowerCase().includes('@')
        );
      case 'assignments':
        return notifications.filter(
          (n) =>
            n.type === 'task_assigned' ||
            n.title?.toLowerCase().includes('assigned') ||
            n.body?.toLowerCase().includes('assigned')
        );
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page" style={{ padding: '0 32px 40px' }}>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--color-muted)' }}>
            Notification center
          </p>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Stay on top of task updates, mentions, and team activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNotifications()}
            className="btn btn-ghost btn-sm"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {unread > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleMarkAllRead}
              className="btn btn-secondary btn-sm"
            >
              <CheckCheck size={16} />
              Mark all as read
            </motion.button>
          )}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
          >
            <Bell size={16} style={{ color: 'var(--color-accent)' }} />
            {unread} unread
          </div>
        </div>
      </div>

      <div
        className="mb-6 flex gap-1 rounded-xl p-1"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', width: 'fit-content' }}
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx('rounded-lg px-4 py-2 text-sm font-medium transition-all', activeTab === tab.key ? 'btn-primary' : 'btn-ghost')}
            style={activeTab === tab.key ? {} : { color: 'var(--color-muted)' }}
          >
            {tab.label}
            {tab.key === 'unread' && unread > 0 && (
              <span
                className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-bold"
                style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
              >
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2"
              style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }}
            />
            <p className="mt-4 text-sm" style={{ color: 'var(--color-muted)' }}>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="empty-state"
          >
            <div className="empty-state-icon">
              <Inbox size={32} />
            </div>
            <p className="empty-state-title">No notifications</p>
            <p className="empty-state-description">
              {activeTab === 'unread'
                ? "You're all caught up! No unread notifications."
                : activeTab === 'mentions'
                  ? 'No mention notifications at this time.'
                  : activeTab === 'assignments'
                    ? 'No assignment notifications at this time.'
                    : 'No notifications to display.'}
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredNotifications.map((notification, index) => {
              const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => !notification.read && handleMarkRead(notification._id)}
                  className={clsx(
                    'group flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all',
                    !notification.read ? 'hover:shadow-soft' : 'opacity-70 hover:opacity-100'
                  )}
                  style={{
                    background: !notification.read ? 'var(--color-surface)' : 'var(--color-surface-hover)',
                    borderColor: !notification.read ? 'var(--color-border)' : 'var(--color-border-light)',
                  }}
                >
                  <div className="relative mt-1 flex-shrink-0">
                    {!notification.read && (
                      <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: config.bg }}>
                      <Icon size={18} style={{ color: config.color }} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                          {notification.body}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: config.bg, color: config.color }}>
                          {config.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="flex-shrink-0 rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50"
                          style={{ color: 'var(--color-danger)' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
