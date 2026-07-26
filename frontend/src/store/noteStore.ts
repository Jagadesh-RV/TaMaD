import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useNoteStore = create((set, get: any) => ({
  notes: [],
  loading: false,

  fetchNotes: async (workspaceId?: string) => {
    set({ loading: true });
    try {
      if (!workspaceId || workspaceId === 'default') {
        workspaceId = '000000000000000000000000';
      }
      
      const { data } = await api.get('/notes', { params: { workspaceId } });
      set({ notes: data, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error('Failed to load notes');
    }
  },

  createNote: async (payload: any) => {
    try {
      const { data } = await api.post('/notes', payload);
      set((s: any) => ({ notes: [data, ...s.notes] }));
      toast.success('Note created');
      return data;
    } catch (err) {
      toast.error('Failed to create note');
      throw err;
    }
  },

  updateNote: async (id: string, payload: any) => {
    try {
      const { data } = await api.put(`/notes/${id}`, payload);
      set((s: any) => ({
        notes: s.notes.map((n: any) => (n._id === id ? data : n)),
      }));
      return data;
    } catch (err) {
      toast.error('Failed to update note');
    }
  },

  deleteNote: async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      set((s: any) => ({ notes: s.notes.filter((n: any) => n._id !== id) }));
      toast.success('Note deleted');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  },
}));
