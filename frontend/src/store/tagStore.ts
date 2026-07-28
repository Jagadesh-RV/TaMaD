import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Tag {
  _id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchTags: (workspaceId: string) => Promise<void>;
  createTag: (payload: Partial<Tag>) => Promise<Tag>;
  updateTag: (id: string, payload: Partial<Tag>) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  loading: false,
  error: null,

  fetchTags: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/tags', { params: { workspaceId } });
      set({ tags: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load tags');
    }
  },

  createTag: async (payload) => {
    try {
      const { data } = await api.post('/tags', payload);
      set(s => ({ tags: [...s.tags, data] }));
      toast.success('Tag created');
      return data;
    } catch {
      toast.error('Failed to create tag');
      throw new Error('Failed to create tag');
    }
  },

  updateTag: async (id, payload) => {
    try {
      const { data } = await api.put(`/tags/${id}`, payload);
      set(s => ({ tags: s.tags.map(t => (t._id === id ? data : t)) }));
      toast.success('Tag updated');
      return data;
    } catch {
      toast.error('Failed to update tag');
      throw new Error('Failed to update tag');
    }
  },

  deleteTag: async (id) => {
    try {
      await api.delete(`/tags/${id}`);
      set(s => ({ tags: s.tags.filter(t => t._id !== id) }));
      toast.success('Tag deleted');
    } catch {
      toast.error('Failed to delete tag');
    }
  },
}));
