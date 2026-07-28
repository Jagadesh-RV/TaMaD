import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Goal {
  _id: string;
  title: string;
  description?: string;
  progress: number;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  fetchGoals: (workspaceId: string) => Promise<void>;
  createGoal: (payload: Partial<Goal>) => Promise<Goal>;
  updateGoal: (id: string, payload: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchGoals: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/goals', { params: { workspaceId } });
      set({ goals: data.goals || data, loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load goals' });
      toast.error('Failed to load goals');
    }
  },

  createGoal: async (payload) => {
    try {
      const { data } = await api.post('/goals', payload);
      set(s => ({ goals: [...s.goals, data] }));
      toast.success('Goal created');
      return data;
    } catch {
      toast.error('Failed to create goal');
      throw new Error('Failed to create goal');
    }
  },

  updateGoal: async (id, payload) => {
    try {
      const { data } = await api.put(`/goals/${id}`, payload);
      set(s => ({ goals: s.goals.map(g => (g._id === id ? data : g)) }));
      return data;
    } catch {
      toast.error('Failed to update goal');
      throw new Error('Failed to update goal');
    }
  },

  deleteGoal: async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      set(s => ({ goals: s.goals.filter(g => g._id !== id) }));
      toast.success('Goal deleted');
    } catch {
      toast.error('Failed to delete goal');
    }
  },
}));
