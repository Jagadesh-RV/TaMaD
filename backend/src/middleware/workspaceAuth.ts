import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Workspace from '../models/Workspace';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';

export const requireWorkspaceMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const workspaceId = req.query.workspaceId || req.body.workspaceId || req.params.workspaceId;

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
    let workspace = await cache.get<any>(cacheKey);

    if (!workspace) {
      workspace = await Workspace.findById(workspaceId).lean();
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      // Cache for 5 mins
      await cache.set(cacheKey, workspace, 300);
    }

    const isMember = workspace.members.some(
      (m: any) => m.userId.toString() === req.user._id.toString()
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
