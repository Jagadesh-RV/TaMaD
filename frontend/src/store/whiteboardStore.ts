import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useWhiteboardStore = create((set, get: any) => ({
  whiteboards: [],
  loading: false,

  fetchWhiteboards: async (workspaceId?: string) => {
    set({ loading: true });
    try {
      if (!workspaceId || workspaceId === 'default') {
        workspaceId = '000000000000000000000000';
      }
      
      const { data } = await api.get('/whiteboards', { params: { workspaceId } });
      set({ whiteboards: data, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error('Failed to load whiteboards');
    }
  },

  createWhiteboard: async (payload: any) => {
    try {
      const { data } = await api.post('/whiteboards', payload);
      set((s: any) => ({ whiteboards: [data, ...s.whiteboards] }));
      toast.success('Whiteboard created');
      return data;
    } catch (err) {
      toast.error('Failed to create whiteboard');
      throw err;
    }
  },

  updateWhiteboard: async (id: string, payload: any) => {
    try {
      const { data } = await api.put(`/whiteboards/${id}`, payload);
      set((s: any) => ({
        whiteboards: s.whiteboards.map((w: any) => (w._id === id ? data : w)),
      }));
      return data;
    } catch (err) {
      // toast.error('Failed to update whiteboard');
    }
  },

  deleteWhiteboard: async (id: string) => {
    try {
      await api.delete(`/whiteboards/${id}`);
      set((s: any) => ({ whiteboards: s.whiteboards.filter((w: any) => w._id !== id) }));
      toast.success('Whiteboard deleted');
    } catch (err) {
      toast.error('Failed to delete whiteboard');
    }
  },
}));
