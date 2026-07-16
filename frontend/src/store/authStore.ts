import { create } from 'zustand';
import api from '../utils/api';

interface UserShape {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
}

interface AuthState {
  user: UserShape | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<UserShape> & { preferences?: Record<string, unknown> }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('tamad_access_token'),
  refreshToken: localStorage.getItem('tamad_refresh_token'),
  loading: true,

  init: async () => {
    const accessToken = localStorage.getItem('tamad_access_token');
    const refreshToken = localStorage.getItem('tamad_refresh_token');

    if (!accessToken || !refreshToken) {
      set({ loading: false, token: null, refreshToken: null, user: null });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, token: accessToken, refreshToken, loading: false });
    } catch {
      localStorage.removeItem('tamad_access_token');
      localStorage.removeItem('tamad_refresh_token');
      set({ user: null, token: null, refreshToken: null, loading: false });
    }
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('tamad_access_token', accessToken);
    localStorage.setItem('tamad_refresh_token', refreshToken);
    set({ token: accessToken, refreshToken, user });
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('tamad_access_token', accessToken);
    localStorage.setItem('tamad_refresh_token', refreshToken);
    set({ token: accessToken, refreshToken, user });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', { refreshToken: localStorage.getItem('tamad_refresh_token') });
    } catch {
      // ignore logout errors and clear local state
    }
    localStorage.removeItem('tamad_access_token');
    localStorage.removeItem('tamad_refresh_token');
    set({ token: null, refreshToken: null, user: null });
  },

  updateProfile: async (payload) => {
    const response = await api.put('/auth/profile', payload);
    set({ user: response.data.user });
  },
}));