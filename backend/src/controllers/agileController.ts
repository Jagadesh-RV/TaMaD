import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Epic from '../models/Epic';
import Sprint from '../models/Sprint';
import Task from '../models/Task';
import { getIO } from '../sockets/socketManager';

// Epics
export const getEpics = async (req: AuthRequest, res: Response) => {
  const { workspaceId, projectId } = req.query;
  const epics = await Epic.find({ workspaceId, projectId }).sort({ createdAt: -1 });
  res.json(epics);
};

export const createEpic = async (req: AuthRequest, res: Response) => {
  const { name, description, projectId, workspaceId } = req.body;
  const epic = await Epic.create({
    name, description, projectId, workspaceId, createdBy: req.user._id
  });
  getIO().to(`workspace_${workspaceId}`).emit('epic_created', epic);
  res.status(201).json(epic);
};

export const updateEpic = async (req: AuthRequest, res: Response) => {
  const epic = await Epic.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (epic) getIO().to(`workspace_${epic.workspaceId}`).emit('epic_updated', epic);
  res.json(epic);
};

export const deleteEpic = async (req: AuthRequest, res: Response) => {
  const epic = await Epic.findByIdAndDelete(req.params.id);
  if (epic) getIO().to(`workspace_${epic.workspaceId}`).emit('epic_deleted', epic._id);
  res.json({ message: 'Epic deleted' });
};

// Sprints
export const getSprints = async (req: AuthRequest, res: Response) => {
  const { workspaceId, projectId } = req.query;
  const sprints = await Sprint.find({ workspaceId, projectId }).sort({ startDate: -1 });
  res.json(sprints);
};

export const createSprint = async (req: AuthRequest, res: Response) => {
  const { name, goal, startDate, endDate, projectId, workspaceId } = req.body;
  const sprint = await Sprint.create({
    name, goal, startDate, endDate, projectId, workspaceId, createdBy: req.user._id
  });
  getIO().to(`workspace_${workspaceId}`).emit('sprint_created', sprint);
  res.status(201).json(sprint);
};

export const updateSprint = async (req: AuthRequest, res: Response) => {
  const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (sprint) getIO().to(`workspace_${sprint.workspaceId}`).emit('sprint_updated', sprint);
  res.json(sprint);
};

export const deleteSprint = async (req: AuthRequest, res: Response) => {
  const sprint = await Sprint.findByIdAndDelete(req.params.id);
  if (sprint) getIO().to(`workspace_${sprint.workspaceId}`).emit('sprint_deleted', sprint._id);
  res.json({ message: 'Sprint deleted' });
};
