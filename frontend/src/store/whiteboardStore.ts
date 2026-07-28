import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Whiteboard {
  _id: string;
  title: string;
  description?: string;
  canvas?: object;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface WhiteboardState {
  whiteboards: Whiteboard[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  fetchWhiteboards: (workspaceId: string) => Promise<void>;
  createWhiteboard: (payload: Partial<Whiteboard>) => Promise<Whiteboard>;
  updateWhiteboard: (id: string, payload: Partial<Whiteboard>) => Promise<Whiteboard>;
  deleteWhiteboard: (id: string) => Promise<void>;
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  whiteboards: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchWhiteboards: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/whiteboards', { params: { workspaceId } });
      set({ whiteboards: data.whiteboards || data, loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load whiteboards' });
      toast.error('Failed to load whiteboards');
    }
  },

  createWhiteboard: async (payload) => {
    try {
      const { data } = await api.post('/whiteboards', payload);
      set(s => ({ whiteboards: [data, ...s.whiteboards] }));
      toast.success('Whiteboard created');
      return data;
    } catch {
      toast.error('Failed to create whiteboard');
      throw new Error('Failed to create whiteboard');
    }
  },

  updateWhiteboard: async (id, payload) => {
    try {
      const { data } = await api.put(`/whiteboards/${id}`, payload);
      set(s => ({
        whiteboards: s.whiteboards.map(w => (w._id === id ? data : w)),
      }));
      return data;
    } catch {
      toast.error('Failed to update whiteboard');
      throw new Error('Failed to update whiteboard');
    }
  },

  deleteWhiteboard: async (id) => {
    try {
      await api.delete(`/whiteboards/${id}`);
      set(s => ({ whiteboards: s.whiteboards.filter(w => w._id !== id) }));
      toast.success('Whiteboard deleted');
    } catch {
      toast.error('Failed to delete whiteboard');
    }
  },
}));
