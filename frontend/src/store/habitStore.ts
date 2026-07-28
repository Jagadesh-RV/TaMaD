import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Habit {
  _id: string;
  title: string;
  description?: string;
  frequency: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  fetchHabits: (workspaceId: string) => Promise<void>;
  createHabit: (payload: Partial<Habit>) => Promise<Habit>;
  updateHabit: (id: string, payload: Partial<Habit>) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchHabits: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/habits', { params: { workspaceId } });
      set({ habits: data.habits || data, loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load habits' });
      toast.error('Failed to load habits');
    }
  },

  createHabit: async (payload) => {
    try {
      const { data } = await api.post('/habits', payload);
      set(s => ({ habits: [...s.habits, data] }));
      toast.success('Habit created');
      return data;
    } catch {
      toast.error('Failed to create habit');
      throw new Error('Failed to create habit');
    }
  },

  updateHabit: async (id, payload) => {
    try {
      const { data } = await api.put(`/habits/${id}`, payload);
      set(s => ({ habits: s.habits.map(h => (h._id === id ? data : h)) }));
      return data;
    } catch {
      toast.error('Failed to update habit');
      throw new Error('Failed to update habit');
    }
  },

  deleteHabit: async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      set(s => ({ habits: s.habits.filter(h => h._id !== id) }));
      toast.success('Habit deleted');
    } catch {
      toast.error('Failed to delete habit');
    }
  },
}));
