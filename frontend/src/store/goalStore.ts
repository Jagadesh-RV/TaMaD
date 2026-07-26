import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useGoalStore = create((set, get: any) => ({
  goals: [],
  loading: false,

  fetchGoals: async (workspaceId?: string) => {
    set({ loading: true });
    try {
      if (!workspaceId || workspaceId === 'default') {
        workspaceId = '000000000000000000000000';
      }
      
      const { data } = await api.get('/goals', { params: { workspaceId } });
      set({ goals: data, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error('Failed to load goals');
    }
  },

  createGoal: async (payload: any) => {
    try {
      const { data } = await api.post('/goals', payload);
      set((s: any) => ({ goals: [...s.goals, data] }));
      toast.success('Goal created');
      return data;
    } catch (err) {
      toast.error('Failed to create goal');
      throw err;
    }
  },

  deleteGoal: async (id: string) => {
    try {
      await api.delete(`/goals/${id}`);
      set((s: any) => ({ goals: s.goals.filter((g: any) => g._id !== id) }));
      toast.success('Goal deleted');
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  },
}));
