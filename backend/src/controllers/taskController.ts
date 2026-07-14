import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import '../models/Category';
import '../models/Tag';
import '../models/User';

// @desc    Get all tasks for a workspace
// @route   GET /api/tasks?workspaceId=...
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  
  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const tasks = await Task.find({ workspaceId, isArchived: false })
    .populate('assignees', 'name email avatarUrl')
    .populate('tags', 'name color')
    .populate('categoryId', 'name color')
    .sort({ order: 1, createdAt: -1 });

  res.json(tasks);
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, workspaceId, dueDate, categoryId, tags, assignees } = req.body;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  // Get max order for the given status to place at the bottom
  const lastTask = await Task.findOne({ workspaceId, status }).sort({ order: -1 });
  const order = lastTask ? lastTask.order + 1000 : 1000;

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    workspaceId,
    dueDate,
    categoryId,
    tags: tags || [],
    assignees: assignees || [],
    createdBy: req.user._id,
    order,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignees', 'name email avatarUrl')
    .populate('tags', 'name color')
    .populate('categoryId', 'name color');

  res.status(201).json(populatedTask);
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  )
    .populate('assignees', 'name email avatarUrl')
    .populate('tags', 'name color')
    .populate('categoryId', 'name color');

  res.json(updatedTask);
};

// @desc    Update task order (DnD)
// @route   PUT /api/tasks/:id/reorder
// @access  Private
export const reorderTask = async (req: AuthRequest, res: Response) => {
  const { status, newOrder } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.status = status;
  task.order = newOrder;
  await task.save();

  res.json(task);
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
};
