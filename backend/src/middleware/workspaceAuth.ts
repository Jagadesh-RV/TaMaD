import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { cache, CACHE_KEYS } from '../utils/cache';
import Workspace, { IWorkspace } from '../models/Workspace';
import mongoose from 'mongoose';

export const requireWorkspaceMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const workspaceId = req.params.id || req.query.workspaceId || req.body.workspaceId || req.params.workspaceId;

  if (!workspaceId) {
    // If there is no workspaceId, we just pass to the next handler.
    // The controller itself should validate if workspaceId is required.
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const cacheKey = CACHE_KEYS.WORKSPACE(workspaceId as string);
    let workspace = await cache.get<IWorkspace>(cacheKey);

    if (!workspace) {
      workspace = await Workspace.findById(workspaceId).lean() as unknown as IWorkspace;
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      // Cache for 5 mins
      await cache.set(cacheKey, workspace, 300);
    }

    const isMember = workspace.members.some(
      (m) => m.userId.toString() === req.user!._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to access this workspace' });
    }

    // Pass the workspace along if needed by downstream controllers
    req.workspace = workspace;
    next();
  } catch (error) {
    console.error('Workspace auth error:', error);
    return res.status(500).json({ error: 'Server error checking workspace permissions' });
  }
};

export const verifyWorkspaceMembership = async (workspaceId: string, userId: string): Promise<boolean> => {
  try {
    const cacheKey = CACHE_KEYS.WORKSPACE(workspaceId);
    let workspace = await cache.get<IWorkspace>(cacheKey);

    if (!workspace) {
      workspace = await Workspace.findById(workspaceId).lean() as unknown as IWorkspace;
      if (!workspace) return false;
      await cache.set(cacheKey, workspace, 300);
    }

    return workspace.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
  } catch {
    return false;
  }
};

export const requireEntityWorkspaceMember = (Model: mongoose.Model<any>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const entityId = req.params.id || req.params.taskId || req.params.projectId;
    if (!entityId) return next();

    try {
      const entity = await Model.findById(entityId).select('workspaceId');
      if (!entity) return res.status(404).json({ error: 'Resource not found' });
      if (!entity.workspaceId) return next();

      const isMember = await verifyWorkspaceMembership(entity.workspaceId.toString(), req.user._id);
      if (!isMember) {
        return res.status(403).json({ error: 'Not authorized to access this resource' });
      }

      next();
    } catch (error) {
      console.error('Entity auth error:', error);
      return res.status(500).json({ error: 'Server error checking resource permissions' });
    }
  };
};

export const requireWorkspaceRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.workspace || !req.user) {
      return res.status(403).json({ error: 'Workspace context missing' });
    }

    const memberEntry = req.workspace.members.find(
      (m) => m.userId.toString() === req.user!._id.toString()
    );

    if (!memberEntry || !roles.includes(memberEntry.role)) {
      return res.status(403).json({ error: `Requires one of roles: ${roles.join(', ')}` });
    }

    next();
  };
};
