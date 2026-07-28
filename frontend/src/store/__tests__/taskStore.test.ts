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

import { useTaskStore } from '../taskStore';
import api from '../../utils/api';

const mockApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
  useTaskStore.setState({
    tasks: [],
    pagination: null,
    loading: false,
    error: null,
    filters: { status: '', priority: '', tag: '', search: '', date: '' },
  });
});

describe('taskStore', () => {
  it('has correct initial state', () => {
    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.pagination).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.filters).toEqual({ status: '', priority: '', tag: '', search: '', date: '' });
  });

  it('setFilter updates a specific filter', () => {
    useTaskStore.getState().setFilter('status', 'done');
    expect(useTaskStore.getState().filters.status).toBe('done');
    expect(useTaskStore.getState().filters.priority).toBe('');
  });

  it('clearFilters resets all filters', () => {
    useTaskStore.setState({ filters: { status: 'done', priority: 'high', tag: 'bug', search: 'test', date: '2024-01-01' } });
    useTaskStore.getState().clearFilters();
    expect(useTaskStore.getState().filters).toEqual({ status: '', priority: '', tag: '', search: '', date: '' });
  });

  it('fetchTasks sets tasks on success', async () => {
    const tasks = [{ _id: '1', title: 'Test Task', status: 'todo', priority: 'medium', workspaceId: 'w1', order: 0, createdBy: 'u1', createdAt: '', updatedAt: '', isArchived: false }];
    mockApi.get.mockResolvedValue({ data: { tasks, pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } } });

    await useTaskStore.getState().fetchTasks('w1');

    const state = useTaskStore.getState();
    expect(state.tasks).toEqual(tasks);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(mockApi.get).toHaveBeenCalledWith('/tasks', { params: { workspaceId: 'w1' } });
  });

  it('fetchTasks sets error on failure', async () => {
    mockApi.get.mockRejectedValue(new Error('Network error'));

    await useTaskStore.getState().fetchTasks('w1');

    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('fetchTasks includes active filters in params', async () => {
    mockApi.get.mockResolvedValue({ data: { tasks: [] } });
    useTaskStore.setState({ filters: { status: 'done', priority: 'high', tag: '', search: '', date: '' } });

    await useTaskStore.getState().fetchTasks('w1');

    expect(mockApi.get).toHaveBeenCalledWith('/tasks', { params: { workspaceId: 'w1', status: 'done', priority: 'high' } });
  });

  it('createTask adds a task to state', async () => {
    const newTask = { _id: '2', title: 'New Task', status: 'todo', priority: 'low', workspaceId: 'w1', order: 0, createdBy: 'u1', createdAt: '', updatedAt: '', isArchived: false };
    mockApi.post.mockResolvedValue({ data: newTask });

    const result = await useTaskStore.getState().createTask({ title: 'New Task', workspaceId: 'w1' });

    expect(result).toEqual(newTask);
    expect(useTaskStore.getState().tasks).toContainEqual(newTask);
  });

  it('deleteTask removes a task from state', async () => {
    useTaskStore.setState({ tasks: [{ _id: '1', title: 'Task', status: 'todo', priority: 'low', workspaceId: 'w1', order: 0, createdBy: 'u1', createdAt: '', updatedAt: '', isArchived: false }] });
    mockApi.delete.mockResolvedValue({});

    await useTaskStore.getState().deleteTask('1');

    expect(useTaskStore.getState().tasks).toEqual([]);
  });
});
