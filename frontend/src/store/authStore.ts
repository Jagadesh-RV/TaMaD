import { create } from 'zustand';
import api from '../utils/api';
import { auth, signOut } from '../services/firebase';

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

interface AuthState {
  user: UserShape | null;
  loading: boolean;
  init: () => Promise<void>;
  completeFirebaseSignIn: (rememberMe?: boolean) => Promise<UserShape>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<UserShape> & { preferences?: Record<string, unknown> }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, loading: false });
    } catch {
      try {
        const response = await api.post('/auth/refresh');
        set({ user: response.data.user, loading: false });
      } catch {
        set({ user: null, loading: false });
      }
    }
  },

  completeFirebaseSignIn: async (rememberMe = false) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('Firebase sign-in did not complete');
    const idToken = await firebaseUser.getIdToken(true);
    const response = await api.post('/auth/firebase/session', { idToken, rememberMe });
    set({ user: response.data.user });
    return response.data.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      await signOut(auth);
      set({ user: null });
    }
  },

  updateProfile: async (payload) => {
    const response = await api.put('/auth/profile', payload);
    set({ user: response.data.user });
  },
}));
