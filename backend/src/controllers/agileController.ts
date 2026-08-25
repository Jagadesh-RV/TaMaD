import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Epic from '../models/Epic';
import Sprint from '../models/Sprint';
import Task from '../models/Task';
import { getIO } from '../sockets/socketManager';

// Epics
export const getEpics = async (req: AuthRequest, res: Response) => {
  const { workspaceId, projectId } = req.query;
  const query: any = {};
  if (workspaceId) query.workspaceId = workspaceId;
  if (projectId) query.projectId = projectId;
  const epics = await Epic.find(query).sort({ createdAt: -1 });
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
  const query: any = {};
  if (workspaceId) query.workspaceId = workspaceId;
  if (projectId) query.projectId = projectId;
  const sprints = await Sprint.find(query).sort({ startDate: -1 });
  res.json(sprints);
};

export const createSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { name, goal, startDate, endDate, projectId, workspaceId } = req.body;

    const sprint = await Sprint.create({
      name, goal, startDate, endDate, projectId, workspaceId, createdBy: req.user._id
    });
    getIO().to(`workspace_${workspaceId}`).emit('sprint_created', sprint);
    res.status(201).json(sprint);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create sprint', details: error.message });
  }
};

export const updateSprint = async (req: AuthRequest, res: Response) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (sprint) getIO().to(`workspace_${sprint.workspaceId}`).emit('sprint_updated', sprint);
    res.json(sprint);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update sprint' });
  }
};

export const deleteSprint = async (req: AuthRequest, res: Response) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (sprint) getIO().to(`workspace_${sprint.workspaceId}`).emit('sprint_deleted', sprint._id);
    res.json({ message: 'Sprint deleted' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete sprint' });
  }
};

export const startSprint = async (req: AuthRequest, res: Response) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    
    // Check if another sprint is already active for this project
    const activeSprint = await Sprint.findOne({ projectId: sprint.projectId, status: 'active' });
    if (activeSprint) return res.status(400).json({ error: 'Another sprint is already active for this project.' });

    sprint.status = 'active';
    await sprint.save();
    getIO().to(`workspace_${sprint.workspaceId}`).emit('sprint_updated', sprint);
    res.json(sprint);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to start sprint' });
  }
};

export const completeSprint = async (req: AuthRequest, res: Response) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    
    sprint.status = 'completed';
    await sprint.save();
    
    // Optionally, move unfinished tasks to backlog or next sprint
    const unfinishedTasks = await Task.find({ sprintId: sprint._id, status: { $ne: 'done' } });
    // Move to backlog
    await Task.updateMany(
      { sprintId: sprint._id, status: { $ne: 'done' } },
      { $unset: { sprintId: 1 } }
    );

    unfinishedTasks.forEach(task => {
      getIO().to(`workspace_${sprint.workspaceId}`).emit('task_updated', { ...task.toObject(), sprintId: null });
    });

    getIO().to(`workspace_${sprint.workspaceId}`).emit('sprint_updated', sprint);
    res.json(sprint);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to complete sprint' });
  }
};
