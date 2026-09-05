import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'read-only-admin';
}

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await api.post('/admin/login', { email, password });
          const data = response.data;
          set({ admin: data.admin, token: data.token, isAuthenticated: true });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Failed to login');
        }
      },

      logout: async () => {
        const token = get().token;
        if (token) {
          try {
            await api.post('/admin/logout', {}, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
          } catch (e) {}
        }
        set({ admin: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'tamad-admin-auth',
    }
  )
);
