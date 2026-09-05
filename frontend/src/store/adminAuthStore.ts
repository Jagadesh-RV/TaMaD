import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api'; // Or use fetch if needed

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
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to login');
        }

        const data = await response.json();
        set({ admin: data.admin, token: data.token, isAuthenticated: true });
      },

      logout: async () => {
        const token = get().token;
        if (token) {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1/admin/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => {});
        }
        set({ admin: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'tamad-admin-auth',
    }
  )
);
