import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export interface DashboardWidget {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  config?: Record<string, any>;
}

export interface Dashboard {
  _id: string;
  name: string;
  workspaceId: string;
  isDefault: boolean;
  layout: DashboardWidget[];
}

interface DashboardState {
  dashboard: Dashboard | null;
  loading: boolean;
  fetchDashboard: (workspaceId: string) => Promise<void>;
  updateLayout: (layout: DashboardWidget[]) => void;
  saveDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboard: null,
  loading: false,

  fetchDashboard: async (workspaceId: string) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/dashboards', { params: { workspaceId } });
      set({ dashboard: data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load dashboard');
    }
  },

  updateLayout: (layout) => {
    set(s => {
      if (!s.dashboard) return s;
      return { dashboard: { ...s.dashboard, layout } };
    });
  },

  saveDashboard: async () => {
    const { dashboard } = get();
    if (!dashboard) return;
    try {
      await api.put(`/dashboards/${dashboard._id}`, { layout: dashboard.layout, name: dashboard.name });
      toast.success('Dashboard saved');
    } catch {
      toast.error('Failed to save dashboard');
    }
  },
}));
