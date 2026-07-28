import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Milestone {
  _id: string;
  name: string;
  description?: string;
  projectId: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MilestoneState {
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  fetchMilestones: (projectId: string) => Promise<void>;
  createMilestone: (payload: Partial<Milestone>) => Promise<Milestone>;
  updateMilestone: (id: string, payload: Partial<Milestone>) => Promise<Milestone>;
  deleteMilestone: (id: string) => Promise<void>;
}

export const useMilestoneStore = create<MilestoneState>((set) => ({
  milestones: [],
  loading: false,
  error: null,

  fetchMilestones: async (projectId) => {
    if (!projectId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/milestones', { params: { projectId } });
      set({ milestones: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load milestones');
    }
  },

  createMilestone: async (payload) => {
    try {
      const { data } = await api.post('/milestones', payload);
      set(s => ({ milestones: [...s.milestones, data] }));
      toast.success('Milestone created');
      return data;
    } catch {
      toast.error('Failed to create milestone');
      throw new Error('Failed to create milestone');
    }
  },

  updateMilestone: async (id, payload) => {
    try {
      const { data } = await api.put(`/milestones/${id}`, payload);
      set(s => ({ milestones: s.milestones.map(m => (m._id === id ? data : m)) }));
      toast.success('Milestone updated');
      return data;
    } catch {
      toast.error('Failed to update milestone');
      throw new Error('Failed to update milestone');
    }
  },

  deleteMilestone: async (id) => {
    try {
      await api.delete(`/milestones/${id}`);
      set(s => ({ milestones: s.milestones.filter(m => m._id !== id) }));
      toast.success('Milestone deleted');
    } catch {
      toast.error('Failed to delete milestone');
    }
  },
}));
