import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../services/firebase', () => ({
  getClientAuth: vi.fn(() => ({ currentUser: null })),
  signOutFromFirebase: vi.fn(),
}));

import { useAuthStore } from '../authStore';
import api from '../../utils/api';
import { signOutFromFirebase } from '../../services/firebase';

const mockApi = vi.mocked(api);
const mockSignOut = vi.mocked(signOutFromFirebase);

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, workspace: null, loading: false });
});

describe('authStore', () => {
  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.workspace).toBeNull();
  });

  it('logout clears user and workspace', async () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Test', role: 'user', authProvider: 'email', emailVerified: true, phoneVerified: false },
      workspace: { _id: 'w1', name: 'Workspace', role: 'admin' },
    });
    mockApi.post.mockResolvedValue({});
    mockSignOut.mockResolvedValue();

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().workspace).toBeNull();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('logoutAll clears user and workspace', async () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Test', role: 'user', authProvider: 'email', emailVerified: true, phoneVerified: false },
      workspace: { _id: 'w1', name: 'Workspace', role: 'admin' },
    });
    mockApi.post.mockResolvedValue({});
    mockSignOut.mockResolvedValue();

    await useAuthStore.getState().logoutAll();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().workspace).toBeNull();
  });
});
