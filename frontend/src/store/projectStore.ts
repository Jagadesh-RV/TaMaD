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
  status?: string;
  startDate?: string;
  endDate?: string;
  health?: 'on-track' | 'at-risk' | 'off-track';
  risks?: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    status: 'open' | 'mitigated' | 'closed';
  }>;
  dependencies?: string[];
  agileSettings?: {
    methodology: 'scrum' | 'kanban' | 'hybrid';
    sprintLengthDays: number;
  };
  members?: Array<{ userId: any; role: string }>;
  isArchived?: boolean;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  fetchProjects: (workspaceId: string) => Promise<void>;
  createProject: (payload: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, payload: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchProjects: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/projects', { params: { workspaceId } });
      set({ projects: data.projects || data, loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load projects' });
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
