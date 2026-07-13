import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('tamad_token'),
  loading: true,

  init: async () => {
    const token = localStorage.getItem('tamad_token');

    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      set({
        user: response.data.user,
        token,
        loading: false
      });
    } catch {
      localStorage.removeItem('tamad_token');
      set({
        user: null,
        token: null,
        loading: false
      });
    }
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('tamad_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, user });
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    localStorage.setItem('tamad_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('tamad_token');
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, user: null });
  }
}));