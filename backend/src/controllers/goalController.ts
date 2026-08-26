// @ts-nocheck
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Goal from '../models/Goal';

export const getGoals = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  const goals = await Goal.find({ workspaceId, userId: req.user._id }).sort({ targetDate: 1 });
  res.json(goals);
};

export const createGoal = async (req: AuthRequest, res: Response) => {
  const { title, description, type, targetDate, workspaceId, milestones } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  const goal = await Goal.create({
    title, description, type, targetDate, workspaceId, milestones, userId: req.user._id
  });
  res.status(201).json(goal);
};

export const updateGoal = async (req: AuthRequest, res: Response) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(goal);
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  await goal.deleteOne();
  res.json({ message: 'Goal removed' });
};
