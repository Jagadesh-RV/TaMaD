import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Note {
  _id: string;
  title: string;
  content: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  fetchNotes: (workspaceId: string) => Promise<void>;
  createNote: (payload: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, payload: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchNotes: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/notes', { params: { workspaceId } });
      set({ notes: data.notes || data, loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load notes' });
      toast.error('Failed to load notes');
    }
  },

  createNote: async (payload) => {
    try {
      const { data } = await api.post('/notes', payload);
      set(s => ({ notes: [data, ...s.notes] }));
      toast.success('Note created');
      return data;
    } catch {
      toast.error('Failed to create note');
      throw new Error('Failed to create note');
    }
  },

  updateNote: async (id, payload) => {
    try {
      const { data } = await api.put(`/notes/${id}`, payload);
      set(s => ({
        notes: s.notes.map(n => (n._id === id ? data : n)),
      }));
      return data;
    } catch {
      toast.error('Failed to update note');
      throw new Error('Failed to update note');
    }
  },

  deleteNote: async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      set(s => ({ notes: s.notes.filter(n => n._id !== id) }));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  },
}));
