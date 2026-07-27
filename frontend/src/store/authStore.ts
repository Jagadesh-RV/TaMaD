import { create } from 'zustand';
import api from '../utils/api';
import { getClientAuth, signOutFromFirebase } from '../services/firebase';

interface UserShape {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  avatarUrl?: string;
  authProvider: 'google' | 'email' | 'phone';
  emailVerified: boolean;
  phoneVerified: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
}

interface WorkspaceShape {
  _id: string;
  name: string;
  description?: string;
  role: string;
}

interface SessionInfo {
  deviceName: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface AuthState {
  user: UserShape | null;
  workspace: WorkspaceShape | null;
  loading: boolean;
  init: () => Promise<void>;
  completeFirebaseSignIn: (rememberMe?: boolean) => Promise<UserShape>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (payload: Partial<UserShape> & { preferences?: Record<string, unknown> }) => Promise<void>;
  syncEmailVerification: () => Promise<UserShape>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  getSessions: () => Promise<SessionInfo[]>;
  getWorkspace: () => Promise<WorkspaceShape | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  workspace: null,
  loading: true,

  init: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, loading: false });
      await get().getWorkspace();
    } catch {
      try {
        const response = await api.post('/auth/refresh');
        set({ user: response.data.user, loading: false });
        await get().getWorkspace();
      } catch {
        set({ user: null, workspace: null, loading: false });
      }
    }
  },

  completeFirebaseSignIn: async (rememberMe = false) => {
    const firebaseUser = getClientAuth().currentUser;
    if (!firebaseUser) throw new Error('Firebase sign-in did not complete');
    const idToken = await firebaseUser.getIdToken(true);
    const response = await api.post('/auth/firebase/session', { idToken, rememberMe });
    set({ user: response.data.user });
    await get().getWorkspace();
    return response.data.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      await signOutFromFirebase();
      set({ user: null, workspace: null });
    }
  },

  logoutAll: async () => {
    try {
      await api.post('/auth/logout-all');
    } finally {
      await signOutFromFirebase();
      set({ user: null, workspace: null });
    }
  },

  updateProfile: async (payload) => {
    const response = await api.put('/auth/profile', payload);
    set({ user: response.data.user });
  },

  syncEmailVerification: async () => {
    const response = await api.post('/auth/sync-verification');
    set({ user: response.data.user });
    return response.data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  deleteAccount: async () => {
    try {
      await api.post('/auth/delete-account');
    } finally {
      await signOutFromFirebase();
      set({ user: null, workspace: null });
    }
  },

  getSessions: async () => {
    const response = await api.get('/auth/sessions');
    return response.data.sessions;
  },

  getWorkspace: async () => {
    try {
      const response = await api.get('/auth/workspace');
      const workspace = response.data.workspace;
      set({ workspace });
      return workspace;
    } catch {
      return null;
    }
  },
}));
