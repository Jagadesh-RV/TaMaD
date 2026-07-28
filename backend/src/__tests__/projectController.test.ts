import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockReq, createMockRes, createMockUser, createMockProject } from './helpers';

vi.mock('../models/Project', () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../models/User', () => ({ default: {} }));

vi.mock('../utils/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    invalidatePattern: vi.fn(),
  },
  CACHE_KEYS: {
    PROJECTS: (workspaceId: string) => `projects:${workspaceId}`,
  },
  CACHE_TTL: {
    PROJECTS: 300,
  },
}));

import Project from '../models/Project';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController';

describe('Project Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    it('returns 400 when workspaceId is missing', async () => {
      const req = createMockReq({ query: {} });
      const res = createMockRes();

      await getProjects(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'workspaceId is required' });
    });

    it('returns projects for a workspace', async () => {
      const mockProjects = [createMockProject()];
      vi.mocked(Project.find).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockProjects),
      } as any);

      const req = createMockReq({ query: { workspaceId: 'workspace123' } });
      const res = createMockRes();

      await getProjects(req as any, res);

      expect(res.json).toHaveBeenCalledWith(mockProjects);
    });
  });

  describe('createProject', () => {
    it('returns 400 when workspaceId is missing', async () => {
      const req = createMockReq({ body: { name: 'Test' }, user: createMockUser() });
      const res = createMockRes();

      await createProject(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'workspaceId is required' });
    });

    it('creates a project successfully', async () => {
      const mockProject = createMockProject();
      vi.mocked(Project.create).mockResolvedValue(mockProject as any);

      const req = createMockReq({
        body: { name: 'New Project', workspaceId: 'workspace123' },
        user: createMockUser(),
      });
      const res = createMockRes();

      await createProject(req as any, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Project.create).toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('returns 404 when project is not found', async () => {
      vi.mocked(Project.findById).mockResolvedValue(null);

      const req = createMockReq({ params: { id: 'nonexistent' }, user: createMockUser() });
      const res = createMockRes();

      await deleteProject(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Project not found' });
    });
  });
});
