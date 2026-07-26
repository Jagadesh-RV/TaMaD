import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useHabitStore = create((set, get: any) => ({
  habits: [],
  loading: false,

  fetchHabits: async (workspaceId?: string) => {
    set({ loading: true });
    try {
      if (!workspaceId || workspaceId === 'default') {
        workspaceId = '000000000000000000000000';
      }
      
      const { data } = await api.get('/habits', { params: { workspaceId } });
      set({ habits: data, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error('Failed to load habits');
    }
  },

  createHabit: async (payload: any) => {
    try {
      const { data } = await api.post('/habits', payload);
      set((s: any) => ({ habits: [...s.habits, data] }));
      toast.success('Habit created');
      return data;
    } catch (err) {
      toast.error('Failed to create habit');
      throw err;
    }
  },

  deleteHabit: async (id: string) => {
    try {
      await api.delete(`/habits/${id}`);
      set((s: any) => ({ habits: s.habits.filter((h: any) => h._id !== id) }));
      toast.success('Habit deleted');
    } catch (err) {
      toast.error('Failed to delete habit');
    }
  },
}));
