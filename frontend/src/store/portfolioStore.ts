import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Portfolio {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioState {
  portfolios: Portfolio[];
  loading: boolean;
  error: string | null;
  fetchPortfolios: (workspaceId: string) => Promise<void>;
  createPortfolio: (payload: Partial<Portfolio>) => Promise<Portfolio>;
  updatePortfolio: (id: string, payload: Partial<Portfolio>) => Promise<Portfolio>;
  deletePortfolio: (id: string) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  loading: false,
  error: null,

  fetchPortfolios: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/portfolios', { params: { workspaceId } });
      set({ portfolios: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load portfolios');
    }
  },

  createPortfolio: async (payload) => {
    try {
      const { data } = await api.post('/portfolios', payload);
      set(s => ({ portfolios: [...s.portfolios, data] }));
      toast.success('Portfolio created');
      return data;
    } catch {
      toast.error('Failed to create portfolio');
      throw new Error('Failed to create portfolio');
    }
  },

  updatePortfolio: async (id, payload) => {
    try {
      const { data } = await api.put(`/portfolios/${id}`, payload);
      set(s => ({ portfolios: s.portfolios.map(p => (p._id === id ? data : p)) }));
      toast.success('Portfolio updated');
      return data;
    } catch {
      toast.error('Failed to update portfolio');
      throw new Error('Failed to update portfolio');
    }
  },

  deletePortfolio: async (id) => {
    try {
      await api.delete(`/portfolios/${id}`);
      set(s => ({ portfolios: s.portfolios.filter(p => p._id !== id) }));
      toast.success('Portfolio deleted');
    } catch {
      toast.error('Failed to delete portfolio');
    }
  },
}));
