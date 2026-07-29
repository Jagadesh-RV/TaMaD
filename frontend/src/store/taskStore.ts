import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  workspaceId: string;
  dueDate?: string;
  order: number;
  tags?: Array<{ name: string; color: string }>;
  assignees?: Array<{ name: string; email: string; avatarUrl?: string }>;
  categoryId?: { name: string; color: string };
  parentTaskId?: { title: string };
  dependencies?: Array<{ title: string; status: string }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  taskType?: 'epic' | 'story' | 'task' | 'bug' | 'subtask';
  epicId?: string;
  sprintId?: string;
  milestoneId?: string;
  storyPoints?: number;
  estimatedTime?: number;
  actualTime?: number;
  watchers?: Array<{ _id: string; name: string; email: string; avatarUrl?: string }>;
  votes?: string[]; // user ids
  attachments?: string[];
  customFields?: Record<string, any>;
  isArchived: boolean;
}

interface TaskFilters {
  status: string;
  priority: string;
  tag: string;
  search: string;
  date: string;
}

interface TaskState {
  tasks: Task[];
  pagination: { total: number; page: number; limit: number; totalPages: number } | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  setFilter: (key: keyof TaskFilters, value: string) => void;
  clearFilters: () => void;
  clearError: () => void;
  fetchTasks: (workspaceId: string) => Promise<void>;
  createTask: (payload: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  reorderTask: (id: string, status: string, newOrder: number) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleStatus: (id: string, currentStatus: string) => Promise<void>;
  bulkUpdate: (taskIds: string[], updates: Partial<Task>, workspaceId: string) => Promise<void>;
  bulkDelete: (taskIds: string[], workspaceId: string) => Promise<void>;
  toggleWatch: (id: string) => Promise<void>;
  toggleVote: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  pagination: null,
  loading: false,
  error: null,
  filters: { status: '', priority: '', tag: '', search: '', date: '' },

  setFilter: (key, value) => set(s => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: { status: '', priority: '', tag: '', search: '', date: '' } }),
  clearError: () => set({ error: null }),

  fetchTasks: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const params: Record<string, string> = { workspaceId };
      const filters = get().filters;
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const { data } = await api.get('/tasks', { params });
      set({
        tasks: data.tasks || data,
        pagination: data.pagination || null,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load tasks' });
      toast.error('Failed to load tasks');
    }
  },

  createTask: async (payload) => {
    try {
      const { data } = await api.post('/tasks', payload);
      set(s => ({ tasks: [...s.tasks, data] }));
      toast.success('Task created');
      return data;
    } catch (err) {
      toast.error('Failed to create task');
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, updates);
      set(s => ({ tasks: s.tasks.map(t => t._id === id ? data : t) }));
      return data;
    } catch (err) {
      toast.error('Failed to update task');
      throw err;
    }
  },

  reorderTask: async (id, status, newOrder) => {
    try {
      const { data } = await api.put(`/tasks/${id}/reorder`, { status, newOrder });
      return data;
    } catch (err) {
      toast.error('Failed to reorder task');
      throw err;
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set(s => ({ tasks: s.tasks.filter(t => t._id !== id) }));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  },

  toggleStatus: async (id, currentStatus) => {
    const next = currentStatus === 'done' ? 'todo' : 'done';
    await get().updateTask(id, { status: next });
  },

  bulkUpdate: async (taskIds, updates, workspaceId) => {
    try {
      await api.put('/tasks/bulk', { taskIds, updates, workspaceId });
      set(s => ({
        tasks: s.tasks.map(t => taskIds.includes(t._id) ? { ...t, ...updates } : t),
      }));
      toast.success('Tasks updated');
    } catch {
      toast.error('Failed to update tasks');
    }
  },

  bulkDelete: async (taskIds, workspaceId) => {
    try {
      await api.delete('/tasks/bulk', { data: { taskIds, workspaceId } });
      set(s => ({
        tasks: s.tasks.filter(t => !taskIds.includes(t._id)),
      }));
      toast.success('Tasks deleted');
    } catch {
      toast.error('Failed to delete tasks');
    }
  },

  toggleWatch: async (id) => {
    try {
      const { data } = await api.post(`/tasks/${id}/watch`);
      set(s => ({ tasks: s.tasks.map(t => t._id === id ? data : t) }));
    } catch {
      toast.error('Failed to toggle watch');
    }
  },

  toggleVote: async (id) => {
    try {
      const { data } = await api.post(`/tasks/${id}/vote`);
      set(s => ({ tasks: s.tasks.map(t => t._id === id ? data : t) }));
    } catch {
      toast.error('Failed to toggle vote');
    }
  },
}));
