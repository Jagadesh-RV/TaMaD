import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useProjectStore } from '../projectStore';
import api from '../../utils/api';

const mockApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
  useProjectStore.setState({ projects: [], loading: false, error: null });
});

describe('projectStore', () => {
  it('has correct initial state', () => {
    const state = useProjectStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchProjects sets projects on success', async () => {
    const projects = [{ _id: '1', name: 'Test Project', color: '#3b82f6', workspaceId: 'w1', createdBy: 'u1', createdAt: '', updatedAt: '' }];
    mockApi.get.mockResolvedValue({ data: { projects } });

    await useProjectStore.getState().fetchProjects('w1');

    expect(useProjectStore.getState().projects).toEqual(projects);
    expect(useProjectStore.getState().loading).toBe(false);
  });

  it('fetchProjects sets error on failure', async () => {
    mockApi.get.mockRejectedValue(new Error('Failed'));

    await useProjectStore.getState().fetchProjects('w1');

    expect(useProjectStore.getState().projects).toEqual([]);
    expect(useProjectStore.getState().error).toBe('Failed');
  });

  it('fetchProjects skips when workspaceId is empty', async () => {
    await useProjectStore.getState().fetchProjects('');
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it('createProject adds a project to state', async () => {
    const project = { _id: '2', name: 'New Project', color: '#10b981', workspaceId: 'w1', createdBy: 'u1', createdAt: '', updatedAt: '' };
    mockApi.post.mockResolvedValue({ data: project });

    const result = await useProjectStore.getState().createProject({ name: 'New Project', workspaceId: 'w1' });

    expect(result).toEqual(project);
    expect(useProjectStore.getState().projects).toContainEqual(project);
  });

  it('deleteProject removes a project from state', async () => {
    useProjectStore.setState({ projects: [{ _id: '1', name: 'P', color: '#000', workspaceId: 'w1', createdBy: 'u1', createdAt: '', updatedAt: '' }] });
    mockApi.delete.mockResolvedValue({});

    await useProjectStore.getState().deleteProject('1');

    expect(useProjectStore.getState().projects).toEqual([]);
  });
});
