import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Milestone from '../models/Milestone';
import { cache } from '../utils/cache';
import { getIO } from '../sockets/socketManager';

export const getMilestones = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ error: 'projectId required' });

  const milestones = await Milestone.find({ projectId })
    .populate('createdBy', 'name email avatarUrl')
    .sort({ dueDate: 1 });

  res.json(milestones);
};

export const createMilestone = async (req: AuthRequest, res: Response) => {
  const { name, description, projectId, dueDate, status } = req.body;
  if (!projectId) return res.status(400).json({ error: 'projectId required' });

  const milestone = await Milestone.create({
    name,
    description,
    projectId,
    dueDate,
    status: status || 'pending',
    createdBy: req.user._id,
  });

  getIO().to(`workspace_${req.body.workspaceId || ''}`).emit('milestone_created', milestone);
  res.status(201).json(milestone);
};

export const updateMilestone = async (req: AuthRequest, res: Response) => {
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

  const updated = await Milestone.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  getIO().to(`workspace_${req.body.workspaceId || ''}`).emit('milestone_updated', updated);
  res.json(updated);
};

export const deleteMilestone = async (req: AuthRequest, res: Response) => {
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

  await milestone.deleteOne();
  getIO().to(`workspace_${req.body.workspaceId || ''}`).emit('milestone_deleted', { milestoneId: milestone._id });
  res.json({ message: 'Milestone removed' });
};
