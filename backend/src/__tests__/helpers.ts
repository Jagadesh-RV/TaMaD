import { vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';

export const createMockReq = (overrides: Partial<Request> = {}): Request => {
  return {
    headers: {},
    cookies: {},
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as Request;
};

export const createMockRes = (): Response => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.cookie = vi.fn(() => res);
  res.clearCookie = vi.fn(() => res);
  return res as Response;
};

export const createMockNext = (): NextFunction => vi.fn();

export const createMockUser = (overrides = {}) => ({
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  isActive: true,
  sessions: [],
  ...overrides,
});

export const createMockTask = (overrides = {}) => ({
  _id: 'task123',
  title: 'Test Task',
  status: 'todo',
  priority: 'medium',
  workspaceId: 'workspace123',
  createdBy: 'user123',
  assignees: [],
  tags: [],
  order: 1000,
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  _id: 'project123',
  name: 'Test Project',
  workspaceId: 'workspace123',
  createdBy: 'user123',
  members: [{ userId: 'user123', role: 'manager' }],
  ...overrides,
});

export const createMockWorkspace = (overrides = {}) => ({
  _id: 'workspace123',
  name: 'Test Workspace',
  ownerId: 'user123',
  members: [{ userId: 'user123', role: 'owner' }],
  isActive: true,
  ...overrides,
});
