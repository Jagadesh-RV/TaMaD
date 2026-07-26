import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  pagination: null,
  loading: false,
  filters: { status: '', priority: '', tag: '', search: '', date: '' },

  setFilter: (key, value) => set(s => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: { status: '', priority: '', tag: '', search: '', date: '' } }),

  fetchTasks: async (workspaceId) => {
    set({ loading: true });
    try {
      if (!workspaceId || workspaceId === 'default') {
        workspaceId = '000000000000000000000000'; // Valid ObjectId format
      }
      const params = { ...get().filters, workspaceId };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      
      const { data } = await api.get('/tasks', { params });
      set({ 
        tasks: data.tasks || data, 
        pagination: data.pagination || null,
        loading: false 
      });
    } catch (err) {
      set({ loading: false });
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
      // We don't need to update local state here if we already optimistically updated it
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
    return get().updateTask(id, { status: next });
  },

  bulkUpdate: async (taskIds, updates, workspaceId) => {
    try {
      await api.put('/tasks/bulk', { taskIds, updates, workspaceId });
      set(s => ({
        tasks: s.tasks.map(t => taskIds.includes(t._id) ? { ...t, ...updates } : t)
      }));
      toast.success('Tasks updated');
    } catch (err) {
      toast.error('Failed to update tasks');
    }
  },

  bulkDelete: async (taskIds, workspaceId) => {
    try {
      await api.delete('/tasks/bulk', { data: { taskIds, workspaceId } });
      set(s => ({
        tasks: s.tasks.filter(t => !taskIds.includes(t._id))
      }));
      toast.success('Tasks deleted');
    } catch (err) {
      toast.error('Failed to delete tasks');
    }
  },
}));