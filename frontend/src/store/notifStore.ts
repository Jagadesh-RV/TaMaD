import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  time?: string;
  read: boolean;
  link?: string;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

interface NotifState {
  notifications: Notification[];
  unread: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addRealtime: (notif: Omit<Notification, 'read' | '_id' | 'createdAt'>) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifications: [],
  unread: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.notifications || [], unread: data.unread || 0, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
        unread: 0,
      }));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  },

  markRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set(s => ({
        notifications: s.notifications.map(n => n._id === id ? { ...n, read: true } : n),
        unread: Math.max(0, s.unread - 1),
      }));
    } catch {
      toast.error('Failed to mark notification');
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set(s => {
        const notif = s.notifications.find(n => n._id === id);
        return {
          notifications: s.notifications.filter(n => n._id !== id),
          unread: notif && !notif.read ? Math.max(0, s.unread - 1) : s.unread,
        };
      });
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  },

  addRealtime: (notif) => {
    set(s => ({
      notifications: [
        { ...notif, _id: `realtime_${Date.now()}`, read: false, createdAt: new Date().toISOString() },
        ...s.notifications,
      ].slice(0, 100),
      unread: s.unread + 1,
    }));
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notif.title, { body: notif.body, icon: '/favicon.ico' });
    }
  },
}));
