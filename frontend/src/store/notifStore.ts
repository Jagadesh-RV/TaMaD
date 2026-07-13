import { create } from 'zustand';
import api from '../utils/api';

export const useNotifStore = create((set, get) => ({
  notifications: [],
  unread: 0,

  fetch: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.notifications, unread: data.unread });
    } catch {}
  },

  markAllRead: async () => {
    await api.patch('/notifications/read-all');
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: 1 })), unread: 0 }));
  },

  markRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: 1 } : n),
      unread: Math.max(0, s.unread - 1),
    }));
  },

  addRealtime: (notif) => {
    set(s => ({
      notifications: [{ ...notif, read: 0 }, ...s.notifications].slice(0, 50),
      unread: s.unread + 1,
    }));
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(notif.title, { body: notif.body, icon: '/favicon.ico' });
    }
  },
}));