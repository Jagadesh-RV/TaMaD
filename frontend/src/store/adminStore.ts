import { create } from 'zustand';
import { useAdminAuthStore } from './adminAuthStore';

export interface PlatformUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface AdminAuditLog {
  _id: string;
  adminId: { _id: string; name: string; email: string };
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: any;
  ipAddress: string;
  createdAt: string;
}

interface AdminState {
  users: PlatformUser[];
  usersTotal: number;
  usersLoading: boolean;
  
  auditLogs: AdminAuditLog[];
  auditLogsTotal: number;
  auditLogsLoading: boolean;

  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  fetchAuditLogs: (page?: number, limit?: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  usersTotal: 0,
  usersLoading: false,

  auditLogs: [],
  auditLogsTotal: 0,
  auditLogsLoading: false,

  fetchUsers: async (page = 1, limit = 20) => {
    set({ usersLoading: true });
    try {
      const token = useAdminAuthStore.getState().token;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1/admin/users?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      set({ users: data.users, usersTotal: data.pagination.total });
    } catch (error) {
      console.error(error);
    } finally {
      set({ usersLoading: false });
    }
  },

  toggleUserStatus: async (userId, isActive) => {
    try {
      const token = useAdminAuthStore.getState().token;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error('Failed to update user status');
      
      // Update local state
      set(state => ({
        users: state.users.map(u => u._id === userId ? { ...u, isActive } : u)
      }));
    } catch (error) {
      console.error(error);
    }
  },

  fetchAuditLogs: async (page = 1, limit = 50) => {
    set({ auditLogsLoading: true });
    try {
      const token = useAdminAuthStore.getState().token;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1/admin/audits?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch audits');
      const data = await res.json();
      set({ auditLogs: data.logs, auditLogsTotal: data.pagination.total });
    } catch (error) {
      console.error(error);
    } finally {
      set({ auditLogsLoading: false });
    }
  }
}));
