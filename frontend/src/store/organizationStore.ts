import { create } from 'zustand';
import api from '../utils/api';

export interface Organization {
  _id: string;
  name: string;
  domain?: string;
  logoUrl?: string;
  ownerId: string;
  members: any[];
  isActive: boolean;
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (data: Partial<Organization>) => Promise<Organization>;
  setCurrentOrganization: (org: Organization | null) => void;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  currentOrganization: null,
  isLoading: false,
  error: null,

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/organizations');
      set({ organizations: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch organizations', isLoading: false });
    }
  },

  createOrganization: async (orgData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/organizations', orgData);
      set({ organizations: [...get().organizations, data], isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to create organization', isLoading: false });
      throw err;
    }
  },

  setCurrentOrganization: (org) => {
    set({ currentOrganization: org });
  },
}));
