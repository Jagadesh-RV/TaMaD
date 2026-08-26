import { create } from 'zustand';
import api from '../utils/api';

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface AutomationAction {
  type: 'SEND_NOTIFICATION' | 'UPDATE_TASK' | 'AUTO_ASSIGN';
  payload: Record<string, any>;
}

export interface AutomationRule {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    event: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_STATUS_CHANGED' | 'TASK_PRIORITY_CHANGED';
    conditions: Condition[];
  };
  action: AutomationAction;
  createdAt: string;
  updatedAt: string;
}

interface AutomationState {
  rules: AutomationRule[];
  loading: boolean;
  error: string | null;
  fetchRules: (workspaceId: string) => Promise<void>;
  createRule: (rule: Partial<AutomationRule>) => Promise<AutomationRule | null>;
  updateRule: (id: string, updates: Partial<AutomationRule>) => Promise<boolean>;
  deleteRule: (id: string) => Promise<boolean>;
  toggleRuleActive: (id: string, isActive: boolean) => Promise<boolean>;
}

export const useAutomationStore = create<AutomationState>((set, get) => ({
  rules: [],
  loading: false,
  error: null,

  fetchRules: async (workspaceId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/automations?workspaceId=${workspaceId}`);
      set({ rules: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch rules', loading: false });
    }
  },

  createRule: async (ruleData) => {
    try {
      const response = await api.post('/automations', ruleData);
      set({ rules: [response.data, ...get().rules] });
      return response.data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to create rule' });
      return null;
    }
  },

  updateRule: async (id, updates) => {
    try {
      const response = await api.put(`/automations/${id}`, updates);
      set({
        rules: get().rules.map(r => r._id === id ? response.data : r)
      });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update rule' });
      return false;
    }
  },

  deleteRule: async (id) => {
    try {
      await api.delete(`/automations/${id}`);
      set({
        rules: get().rules.filter(r => r._id !== id)
      });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to delete rule' });
      return false;
    }
  },

  toggleRuleActive: async (id, isActive) => {
    return await get().updateRule(id, { isActive });
  }
}));
