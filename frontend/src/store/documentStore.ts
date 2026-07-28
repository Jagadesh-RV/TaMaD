import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Document {
  _id: string;
  title: string;
  content: string;
  workspaceId: string;
  createdBy: string;
  folderId?: string;
  tags: Array<{ _id: string; name: string; color: string }>;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'title' | 'updatedAt' | 'createdAt';
  sortDir: 'asc' | 'desc';
  setSearchQuery: (query: string) => void;
  setSortBy: (field: 'title' | 'updatedAt' | 'createdAt') => void;
  toggleSortDir: () => void;
  clearError: () => void;
  fetchDocuments: (workspaceId: string) => Promise<void>;
  getDocument: (id: string) => Promise<Document | null>;
  createDocument: (payload: Partial<Document>) => Promise<Document>;
  updateDocument: (id: string, payload: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  archiveDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  searchQuery: '',
  sortBy: 'updatedAt',
  sortDir: 'desc',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (field) => set({ sortBy: field }),
  toggleSortDir: () => set(s => ({ sortDir: s.sortDir === 'asc' ? 'desc' : 'asc' })),
  clearError: () => set({ error: null }),

  fetchDocuments: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/documents', { params: { workspaceId } });
      set({ documents: Array.isArray(data) ? data : data.documents || [], loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load documents' });
      toast.error('Failed to load documents');
    }
  },

  getDocument: async (id) => {
    try {
      const { data } = await api.get(`/documents/${id}`);
      set({ currentDocument: data });
      return data;
    } catch {
      toast.error('Failed to load document');
      return null;
    }
  },

  createDocument: async (payload) => {
    try {
      const { data } = await api.post('/documents', payload);
      set(s => ({ documents: [data, ...s.documents] }));
      toast.success('Document created');
      return data;
    } catch {
      toast.error('Failed to create document');
      throw new Error('Failed to create document');
    }
  },

  updateDocument: async (id, payload) => {
    try {
      const { data } = await api.put(`/documents/${id}`, payload);
      set(s => ({
        documents: s.documents.map(d => d._id === id ? data : d),
        currentDocument: s.currentDocument?._id === id ? data : s.currentDocument,
      }));
      return data;
    } catch {
      toast.error('Failed to update document');
      throw new Error('Failed to update document');
    }
  },

  deleteDocument: async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      set(s => ({
        documents: s.documents.filter(d => d._id !== id),
        currentDocument: s.currentDocument?._id === id ? null : s.currentDocument,
      }));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  },

  archiveDocument: async (id) => {
    try {
      const { data } = await api.put(`/documents/${id}`, { isArchived: true });
      set(s => ({
        documents: s.documents.map(d => d._id === id ? data : d),
      }));
      toast.success('Document archived');
    } catch {
      toast.error('Failed to archive document');
    }
  },

  restoreDocument: async (id) => {
    try {
      const { data } = await api.put(`/documents/${id}`, { isArchived: false });
      set(s => ({
        documents: s.documents.map(d => d._id === id ? data : d),
      }));
      toast.success('Document restored');
    } catch {
      toast.error('Failed to restore document');
    }
  },
}));
