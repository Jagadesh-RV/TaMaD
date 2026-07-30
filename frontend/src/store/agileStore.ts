import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Sprint {
  _id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  projectId?: string;
  workspaceId: string;
}

interface AgileState {
  sprints: Sprint[];
  loading: boolean;
  fetchSprints: (workspaceId: string, projectId: string) => Promise<void>;
  createSprint: (payload: Partial<Sprint>) => Promise<Sprint>;
  updateSprint: (id: string, payload: Partial<Sprint>) => Promise<Sprint>;
  startSprint: (id: string) => Promise<Sprint>;
  completeSprint: (id: string) => Promise<Sprint>;
}

export const useAgileStore = create<AgileState>((set) => ({
  sprints: [],
  loading: false,

  fetchSprints: async (workspaceId, projectId) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/agile/sprints', { params: { workspaceId, projectId } });
      set({ sprints: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load sprints');
    }
  },

  createSprint: async (payload) => {
    try {
      const { data } = await api.post('/agile/sprints', payload);
      set(s => ({ sprints: [data, ...s.sprints] }));
      toast.success('Sprint created');
      return data;
    } catch {
      toast.error('Failed to create sprint');
      throw new Error('Failed to create sprint');
    }
  },

  updateSprint: async (id, payload) => {
    try {
      const { data } = await api.put(`/agile/sprints/${id}`, payload);
      set(s => ({ sprints: s.sprints.map(sp => sp._id === id ? data : sp) }));
      return data;
    } catch {
      toast.error('Failed to update sprint');
      throw new Error('Failed to update sprint');
    }
  },

  startSprint: async (id) => {
    try {
      const { data } = await api.post(`/agile/sprints/${id}/start`);
      set(s => ({ sprints: s.sprints.map(sp => sp._id === id ? data : sp) }));
      toast.success('Sprint started successfully!');
      return data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start sprint');
      throw err;
    }
  },

  completeSprint: async (id) => {
    try {
      const { data } = await api.post(`/agile/sprints/${id}/complete`);
      set(s => ({ sprints: s.sprints.map(sp => sp._id === id ? data : sp) }));
      toast.success('Sprint completed successfully!');
      return data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete sprint');
      throw err;
    }
  }
}));
