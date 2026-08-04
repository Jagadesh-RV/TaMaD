import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface FileItem {
  _id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  storagePath: string;
  workspaceId: string;
  uploadedBy: { _id: string; name: string; email: string };
  folder: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  byType: { _id: string; count: number; totalSize: number }[];
}

interface FileState {
  files: FileItem[];
  currentFile: FileItem | null;
  stats: FileStats | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'originalName' | 'createdAt' | 'size';
  sortDir: 'asc' | 'desc';
  showArchived: boolean;
  setSearchQuery: (q: string) => void;
  setSortBy: (field: 'originalName' | 'createdAt' | 'size') => void;
  toggleSortDir: () => void;
  toggleShowArchived: () => void;
  fetchFiles: (workspaceId: string) => Promise<void>;
  getFile: (id: string) => Promise<FileItem | null>;
  createFileMetadata: (data: Partial<FileItem> & { workspaceId: string }) => Promise<FileItem>;
  updateFileMetadata: (id: string, data: { originalName?: string; folder?: string }) => Promise<FileItem>;
  archiveFile: (id: string) => Promise<void>;
  restoreFile: (id: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  fetchStats: (workspaceId: string) => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  currentFile: null,
  stats: null,
  loading: false,
  error: null,
  searchQuery: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
  showArchived: false,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (field) => {
    const state = get();
    if (state.sortBy === field) {
      set({ sortDir: state.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortBy: field, sortDir: 'desc' });
    }
  },
  toggleSortDir: () => set(s => ({ sortDir: s.sortDir === 'asc' ? 'desc' : 'asc' })),
  toggleShowArchived: () => set(s => ({ showArchived: !s.showArchived })),

  fetchFiles: async (workspaceId) => {
    set({ loading: true });
    try {
      const { searchQuery, sortBy, sortDir, showArchived } = get();
      const params: any = { workspaceId, sortBy, sortDir };
      if (searchQuery) params.search = searchQuery;

      const { data } = await api.get('/files', { params });
      const files = showArchived ? data : data.filter((f: FileItem) => !f.isArchived);
      set({ files, loading: false });
    } catch {
      toast.error('Failed to load files');
      set({ loading: false });
    }
  },

  getFile: async (id) => {
    try {
      const { data } = await api.get(`/files/${id}`);
      set({ currentFile: data });
      return data;
    } catch {
      toast.error('Failed to load file');
      return null;
    }
  },

  createFileMetadata: async (fileData) => {
    try {
      const { data } = await api.post('/files', fileData);
      set(s => ({ files: [data, ...s.files] }));
      toast.success('File saved');
      return data;
    } catch {
      toast.error('Failed to save file metadata');
      throw new Error('Failed to save file metadata');
    }
  },

  updateFileMetadata: async (id, updateData) => {
    try {
      const { data } = await api.put(`/files/${id}`, updateData);
      set(s => ({
        files: s.files.map(f => f._id === id ? data : f),
      }));
      toast.success('File updated');
      return data;
    } catch {
      toast.error('Failed to update file');
      throw new Error('Failed to update file');
    }
  },

  archiveFile: async (id) => {
    try {
      await api.put(`/files/${id}/archive`);
      set(s => ({
        files: s.files.map(f => f._id === id ? { ...f, isArchived: true } : f),
      }));
      toast.success('File archived');
    } catch {
      toast.error('Failed to archive file');
    }
  },

  restoreFile: async (id) => {
    try {
      await api.put(`/files/${id}/restore`);
      set(s => ({
        files: s.files.map(f => f._id === id ? { ...f, isArchived: false } : f),
      }));
      toast.success('File restored');
    } catch {
      toast.error('Failed to restore file');
    }
  },

  deleteFile: async (id) => {
    try {
      await api.delete(`/files/${id}`);
      set(s => ({ files: s.files.filter(f => f._id !== id) }));
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete file');
    }
  },

  fetchStats: async (workspaceId) => {
    try {
      const { data } = await api.get('/files/stats', { params: { workspaceId } });
      set({ stats: data });
    } catch (error) {
      // Ignore error
    }
  },
}));
