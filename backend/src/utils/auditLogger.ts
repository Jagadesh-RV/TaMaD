import AuditLog from '../models/AuditLog';
import { getIO } from '../sockets/socketManager';
import mongoose from 'mongoose';

export const createAuditLog = async (
  workspaceId: string,
  userId: string,
  action: string,
  entityType: 'Task' | 'Project' | 'Workspace',
  entityId: string,
  details?: Record<string, any>
) => {
  const log = await AuditLog.create({
    workspaceId,
    userId,
    action,
    entityType,
    entityId,
    details,
  });

  // Broadcast the new activity to the workspace
  getIO().to(`workspace_${workspaceId}`).emit('activity_feed_updated', log);

  return log;
};
