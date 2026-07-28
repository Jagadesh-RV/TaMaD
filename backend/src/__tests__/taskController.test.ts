import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockReq, createMockRes, createMockUser, createMockTask } from './helpers';

vi.mock('../models/Task', () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('../models/Category', () => ({ default: {} }));
vi.mock('../models/Tag', () => ({ default: {} }));
vi.mock('../models/User', () => ({ default: {} }));

vi.mock('../sockets/socketManager', () => ({
  getIO: () => ({
    to: () => ({
      emit: vi.fn(),
    }),
  }),
}));

vi.mock('../utils/auditLogger', () => ({
  createAuditLog: vi.fn(),
}));

vi.mock('../utils/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    invalidatePattern: vi.fn(),
  },
  CACHE_KEYS: {
    TASKS: (workspaceId: string, params: string) => `tasks:${workspaceId}:${params}`,
  },
}));

vi.mock('../controllers/notificationController', () => ({
  createNotification: vi.fn(),
}));

import Task from '../models/Task';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';

describe('Task Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('returns 400 when workspaceId is missing', async () => {
      const req = createMockReq({ query: {} });
      const res = createMockRes();

      await getTasks(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'workspaceId is required' });
    });

    it('returns tasks for a workspace', async () => {
      const mockTasks = [createMockTask()];
      vi.mocked(Task.find).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockTasks),
      } as any);
      vi.mocked(Task.countDocuments).mockResolvedValue(1);

      const req = createMockReq({ query: { workspaceId: 'workspace123' } });
      const res = createMockRes();

      await getTasks(req as any, res);

      expect(res.json).toHaveBeenCalledWith({
        tasks: mockTasks,
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });
  });

  describe('createTask', () => {
    it('returns 400 when workspaceId is missing', async () => {
      const req = createMockReq({ body: { title: 'Test' }, user: createMockUser() });
      const res = createMockRes();

      await createTask(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'workspaceId is required' });
    });

    it('creates a task successfully', async () => {
      const mockTask = createMockTask();
      vi.mocked(Task.findOne).mockResolvedValue(null);
      vi.mocked(Task.create).mockResolvedValue(mockTask as any);
      vi.mocked(Task.findById).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockTask),
      } as any);

      const req = createMockReq({
        body: {
          title: 'New Task',
          workspaceId: 'workspace123',
          status: 'todo',
          priority: 'medium',
        },
        user: createMockUser(),
      });
      const res = createMockRes();

      await createTask(req as any, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Task.create).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('returns 404 when task is not found', async () => {
      vi.mocked(Task.findById).mockResolvedValue(null);

      const req = createMockReq({ params: { id: 'nonexistent' }, user: createMockUser() });
      const res = createMockRes();

      await deleteTask(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('deletes a task successfully', async () => {
      const mockTask = { ...createMockTask(), deleteOne: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(Task.findById).mockResolvedValue(mockTask as any);

      const req = createMockReq({ params: { id: 'task123' }, user: createMockUser() });
      const res = createMockRes();

      await deleteTask(req as any, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Task removed' });
    });
  });
});
