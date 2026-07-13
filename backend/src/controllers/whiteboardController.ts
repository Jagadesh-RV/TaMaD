import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Whiteboard from '../models/Whiteboard';

export const getWhiteboards = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  const whiteboards = await Whiteboard.find({ workspaceId, isArchived: false }).sort({ updatedAt: -1 });
  res.json(whiteboards);
};

export const getWhiteboardById = async (req: AuthRequest, res: Response) => {
  const whiteboard = await Whiteboard.findById(req.params.id);
  if (!whiteboard) return res.status(404).json({ error: 'Whiteboard not found' });
  res.json(whiteboard);
};

export const createWhiteboard = async (req: AuthRequest, res: Response) => {
  const { title, elements, workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  
  const whiteboard = await Whiteboard.create({
    title: title || 'Untitled Whiteboard',
    elements: elements || [],
    workspaceId,
    createdBy: req.user._id,
  });
  res.status(201).json(whiteboard);
};

export const updateWhiteboard = async (req: AuthRequest, res: Response) => {
  const whiteboard = await Whiteboard.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(whiteboard);
};

export const deleteWhiteboard = async (req: AuthRequest, res: Response) => {
  const whiteboard = await Whiteboard.findById(req.params.id);
  if (!whiteboard) return res.status(404).json({ error: 'Whiteboard not found' });
  await whiteboard.deleteOne();
  res.json({ message: 'Whiteboard removed' });
};
