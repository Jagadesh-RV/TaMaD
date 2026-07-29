import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface WorkspaceMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  role: 'owner' | 'admin' | 'member' | 'guest';
}

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  type: 'personal' | 'team';
  teamId?: string;
  ownerId: string;
  members: WorkspaceMember[];
  isActive: boolean;
  settings: {
    allowGuests: boolean;
    isPublic: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  fetchWorkspaces: () => Promise<void>;
  getWorkspaceById: (id: string) => Promise<void>;
  createWorkspace: (payload: Partial<Workspace>) => Promise<Workspace>;
  updateWorkspace: (id: string, payload: Partial<Workspace>) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  addMember: (workspaceId: string, email: string, role?: string) => Promise<void>;
  updateMemberRole: (workspaceId: string, userId: string, role: string) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  getWorkspaceStats: (id: string) => Promise<any>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/workspaces');
      set({ workspaces: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load workspaces');
    }
  },

  getWorkspaceById: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/workspaces/${id}`);
      set({ currentWorkspace: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load workspace');
    }
  },

  createWorkspace: async (payload) => {
    try {
      const { data } = await api.post('/workspaces', payload);
      set(s => ({ workspaces: [data, ...s.workspaces] }));
      toast.success('Workspace created');
      return data;
    } catch {
      toast.error('Failed to create workspace');
      throw new Error('Failed to create workspace');
    }
  },

  updateWorkspace: async (id, payload) => {
    try {
      const { data } = await api.put(`/workspaces/${id}`, payload);
      set(s => ({
        workspaces: s.workspaces.map(w => (w._id === id ? data : w)),
        currentWorkspace: s.currentWorkspace?._id === id ? data : s.currentWorkspace,
      }));
      toast.success('Workspace updated');
      return data;
    } catch {
      toast.error('Failed to update workspace');
      throw new Error('Failed to update workspace');
    }
  },

  deleteWorkspace: async (id) => {
    try {
      await api.delete(`/workspaces/${id}`);
      set(s => ({ workspaces: s.workspaces.filter(w => w._id !== id) }));
      toast.success('Workspace archived');
    } catch {
      toast.error('Failed to delete workspace');
    }
  },

  addMember: async (workspaceId, email, role = 'member') => {
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/members`, { email, role });
      set(s => ({
        workspaces: s.workspaces.map(w => (w._id === workspaceId ? data : w)),
        currentWorkspace: s.currentWorkspace?._id === workspaceId ? data : s.currentWorkspace,
      }));
      toast.success('Member added');
    } catch {
      toast.error('Failed to add member');
    }
  },

  updateMemberRole: async (workspaceId, userId, role) => {
    try {
      const { data } = await api.put(`/workspaces/${workspaceId}/members/role`, { userId, role });
      set(s => ({
        workspaces: s.workspaces.map(w => (w._id === workspaceId ? data : w)),
        currentWorkspace: s.currentWorkspace?._id === workspaceId ? data : s.currentWorkspace,
      }));
      toast.success('Member role updated');
    } catch {
      toast.error('Failed to update member role');
    }
  },

  removeMember: async (workspaceId, userId) => {
    try {
      const { data } = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      set(s => ({
        workspaces: s.workspaces.map(w => (w._id === workspaceId ? data : w)),
        currentWorkspace: s.currentWorkspace?._id === workspaceId ? data : s.currentWorkspace,
      }));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  },

  getWorkspaceStats: async (id) => {
    try {
      const { data } = await api.get(`/workspaces/${id}/stats`);
      return data;
    } catch {
      toast.error('Failed to load workspace stats');
      return null;
    }
  },
}));
