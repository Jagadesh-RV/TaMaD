import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  fetchProjects: (workspaceId: string) => Promise<void>;
  createProject: (payload: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, payload: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/projects', { params: { workspaceId } });
      set({ projects: data.projects || data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load projects');
    }
  },

  createProject: async (payload) => {
    try {
      const { data } = await api.post('/projects', payload);
      set(s => ({ projects: [data, ...s.projects] }));
      toast.success('Project created');
      return data;
    } catch {
      toast.error('Failed to create project');
      throw new Error('Failed to create project');
    }
  },

  updateProject: async (id, payload) => {
    try {
      const { data } = await api.put(`/projects/${id}`, payload);
      set(s => ({ projects: s.projects.map(p => p._id === id ? data : p) }));
      return data;
    } catch {
      toast.error('Failed to update project');
      throw new Error('Failed to update project');
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      set(s => ({ projects: s.projects.filter(p => p._id !== id) }));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  },
}));
