import { create } from 'zustand';
import api from '../api/api';
import toast from 'react-hot-toast';

export const useProjectStore = create((set, get: any) => ({
  projects: [],
  loading: false,

  fetchProjects: async (workspaceId?: string) => {
    set({ loading: true });
    try {
      if (!workspaceId || workspaceId === 'default') {
        workspaceId = '000000000000000000000000';
      }
      
      const { data } = await api.get('/projects', { params: { workspaceId } });
      set({ projects: data, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error('Failed to load projects');
    }
  },

  createProject: async (payload: any) => {
    try {
      const { data } = await api.post('/projects', payload);
      set((s: any) => ({ projects: [data, ...s.projects] }));
      toast.success('Project created');
      return data;
    } catch (err) {
      toast.error('Failed to create project');
      throw err;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      set((s: any) => ({ projects: s.projects.filter((p: any) => p._id !== id) }));
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  },
}));
