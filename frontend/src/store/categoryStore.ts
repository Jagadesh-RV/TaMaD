import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: (workspaceId: string) => Promise<void>;
  createCategory: (payload: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, payload: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/categories', { params: { workspaceId } });
      set({ categories: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load categories');
    }
  },

  createCategory: async (payload) => {
    try {
      const { data } = await api.post('/categories', payload);
      set(s => ({ categories: [...s.categories, data] }));
      toast.success('Category created');
      return data;
    } catch {
      toast.error('Failed to create category');
      throw new Error('Failed to create category');
    }
  },

  updateCategory: async (id, payload) => {
    try {
      const { data } = await api.put(`/categories/${id}`, payload);
      set(s => ({ categories: s.categories.map(c => (c._id === id ? data : c)) }));
      toast.success('Category updated');
      return data;
    } catch {
      toast.error('Failed to update category');
      throw new Error('Failed to update category');
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      set(s => ({ categories: s.categories.filter(c => c._id !== id) }));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  },
}));
