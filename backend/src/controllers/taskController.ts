import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import '../models/Category';
import '../models/Tag';
import '../models/User';
import { getIO } from '../sockets/socketManager';
import { createAuditLog } from '../utils/auditLogger';

// @desc    Get all tasks for a workspace
// @route   GET /api/tasks?workspaceId=...
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response) => {
  const { workspaceId, status, priority, assigneeId, page = '1', limit = '50', sortBy = 'order', sortDir = '1' } = req.query;
  
  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const query: any = { workspaceId, isArchived: false };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assigneeId) query.assignees = assigneeId;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const sortOptions: any = {};
  sortOptions[sortBy as string] = parseInt(sortDir as string, 10);

  const tasks = await Task.find(query)
    .populate('assignees', 'name email avatarUrl')
    .populate('tags', 'name color')
    .populate('categoryId', 'name color')
    .populate('dependencies', 'title status')
    .populate('parentTaskId', 'title')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  const total = await Task.countDocuments(query);

  res.json({
    tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, workspaceId, dueDate, categoryId, tags, assignees, dependencies, parentTaskId } = req.body;

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
    dependencies: dependencies || [],
    parentTaskId,
    createdBy: req.user._id,
    order,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignees', 'name email avatarUrl')
    .populate('tags', 'name color')
    .populate('categoryId', 'name color')
    .populate('dependencies', 'title status')
    .populate('parentTaskId', 'title');

  getIO().to(`workspace_${workspaceId}`).emit('task_created', populatedTask);
  
  await createAuditLog(
    workspaceId as string,
    req.user._id,
    'created task',
    'Task',
    task._id.toString(),
    { title: task.title }
  );

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
    .populate('categoryId', 'name color')
    .populate('dependencies', 'title status')
    .populate('parentTaskId', 'title');

  getIO().to(`workspace_${task.workspaceId}`).emit('task_updated', updatedTask);

  await createAuditLog(
    task.workspaceId.toString(),
    req.user._id,
    'updated task',
    'Task',
    task._id.toString(),
    { title: task.title }
  );

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

  getIO().to(`workspace_${task.workspaceId}`).emit('task_updated', task);

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
  
  getIO().to(`workspace_${task.workspaceId}`).emit('task_deleted', { taskId: req.params.id });
  
  await createAuditLog(
    task.workspaceId.toString(),
    req.user._id,
    'deleted task',
    'Task',
    task._id.toString(),
    { title: task.title }
  );
  
  res.json({ message: 'Task removed' });
};

// @desc    Bulk update tasks (e.g. change status)
// @route   PUT /api/tasks/bulk
// @access  Private
export const bulkUpdateTasks = async (req: AuthRequest, res: Response) => {
  const { taskIds, updates } = req.body;
  if (!taskIds || !Array.isArray(taskIds)) {
    return res.status(400).json({ error: 'taskIds array is required' });
  }

  await Task.updateMany(
    { _id: { $in: taskIds }, workspaceId: req.body.workspaceId },
    { $set: updates }
  );

  getIO().to(`workspace_${req.body.workspaceId}`).emit('tasks_bulk_updated', { taskIds, updates });

  res.json({ message: 'Tasks updated successfully' });
};

// @desc    Bulk delete tasks
// @route   DELETE /api/tasks/bulk
// @access  Private
export const bulkDeleteTasks = async (req: AuthRequest, res: Response) => {
  const { taskIds, workspaceId } = req.body;
  if (!taskIds || !Array.isArray(taskIds) || !workspaceId) {
    return res.status(400).json({ error: 'taskIds and workspaceId are required' });
  }

  await Task.deleteMany({ _id: { $in: taskIds }, workspaceId });
  
  getIO().to(`workspace_${workspaceId}`).emit('tasks_bulk_deleted', { taskIds });

  res.json({ message: 'Tasks deleted successfully' });
};
