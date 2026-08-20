import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Workspace from '../models/Workspace';
import '../models/Category';
import '../models/Tag';
import '../models/User';
import { getIO } from '../sockets/socketManager';
import { createAuditLog } from '../utils/auditLogger';
import { createNotification } from './notificationController';
import { cache, CACHE_KEYS } from '../utils/cache';

const emitTaskAssigned = async (taskId: string, taskTitle: string, newAssigneeIds: string[], assignedBy: string, workspaceId: string) => {
  const io = getIO();
  for (const userId of newAssigneeIds) {
    io.to(`user_${userId}`).emit('task_assigned', { taskId, taskTitle, assignedBy });
    await createNotification(
      userId,
      workspaceId,
      'Task Assigned',
      `You have been assigned to "${taskTitle}"`,
      'task_assigned',
      { entityId: taskId, entityType: 'task', createdBy: assignedBy }
    );
  }
};

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
  const { 
    title, description, status, priority, workspaceId, dueDate, 
    categoryId, tags, assignees, dependencies, parentTaskId,
    watchers, customFields, attachments, storyPoints, estimatedTime
  } = req.body;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  // Verify assignees belong to the workspace
  if (assignees && Array.isArray(assignees)) {
    const workspace = await Workspace.findById(workspaceId);
    if (workspace) {
      const validMemberIds = workspace.members.map((m: any) => m.userId.toString());
      validMemberIds.push(workspace.ownerId.toString());
      const invalidAssignees = assignees.filter((id: string) => !validMemberIds.includes(id));
      if (invalidAssignees.length > 0) {
        return res.status(403).json({ error: 'One or more assignees are not members of this workspace' });
      }
    }
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
    watchers: watchers || [],
    customFields: customFields || {},
    attachments: attachments || [],
    storyPoints,
    estimatedTime,
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

  await cache.invalidatePattern(CACHE_KEYS.TASKS(workspaceId as string, '*'));

  if (assignees && assignees.length > 0) {
    await emitTaskAssigned(task._id.toString(), title, assignees, req.user._id, workspaceId as string);
  }

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

  // Prevent moving task to a different workspace
  if (req.body.workspaceId && req.body.workspaceId !== task.workspaceId.toString()) {
    delete req.body.workspaceId;
  }

  // Verify assignees belong to the workspace
  if (req.body.assignees && Array.isArray(req.body.assignees)) {
    const workspace = await Workspace.findById(task.workspaceId);
    if (workspace) {
      const validMemberIds = workspace.members.map((m: any) => m.userId.toString());
      validMemberIds.push(workspace.ownerId.toString());
      const invalidAssignees = req.body.assignees.filter((id: string) => !validMemberIds.includes(id));
      if (invalidAssignees.length > 0) {
        return res.status(403).json({ error: 'One or more assignees are not members of this workspace' });
      }
    }
  }

  const previousAssigneeIds = (task.assignees || []).map((id: any) => id.toString());

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  )
    .populate('assignees', 'name email avatarUrl')
    .populate('watchers', 'name email avatarUrl')
    .populate('tags', 'name color')
    .populate('categoryId', 'name color')
    .populate('dependencies', 'title status')
    .populate('parentTaskId', 'title');

  getIO().to(`workspace_${task.workspaceId}`).emit('task_updated', updatedTask);

  await cache.invalidatePattern(CACHE_KEYS.TASKS(task.workspaceId.toString(), '*'));

  if (updatedTask && req.body.assignees && Array.isArray(req.body.assignees)) {
    const newAssigneeIds = req.body.assignees.filter((id: string) => !previousAssigneeIds.includes(id));
    if (newAssigneeIds.length > 0) {
      await emitTaskAssigned(task._id.toString(), updatedTask.title, newAssigneeIds, req.user._id, task.workspaceId.toString());
    }
  }

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

  await cache.invalidatePattern(CACHE_KEYS.TASKS(task.workspaceId.toString(), '*'));

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
  
  await cache.invalidatePattern(CACHE_KEYS.TASKS(task.workspaceId.toString(), '*'));
  
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

  await cache.invalidatePattern(CACHE_KEYS.TASKS(req.body.workspaceId, '*'));

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

  await cache.invalidatePattern(CACHE_KEYS.TASKS(workspaceId, '*'));

  res.json({ message: 'Tasks deleted successfully' });
};

// @desc    Toggle watch on a task
// @route   POST /api/tasks/:id/watch
// @access  Private
export const toggleWatchTask = async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const userId = req.user._id;
  const watcherIndex = task.watchers.indexOf(userId);

  if (watcherIndex === -1) {
    task.watchers.push(userId);
  } else {
    task.watchers.splice(watcherIndex, 1);
  }

  await task.save();
  const populatedTask = await Task.findById(task._id)
    .populate('assignees watchers', 'name email avatarUrl');

  getIO().to(`workspace_${task.workspaceId}`).emit('task_updated', populatedTask);
  res.json(populatedTask);
};

// @desc    Toggle vote on a task
// @route   POST /api/tasks/:id/vote
// @access  Private
export const toggleVoteTask = async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const userId = req.user._id;
  const voteIndex = task.votes.indexOf(userId);

  if (voteIndex === -1) {
    task.votes.push(userId);
  } else {
    task.votes.splice(voteIndex, 1);
  }

  await task.save();
  
  getIO().to(`workspace_${task.workspaceId}`).emit('task_updated', task);
  res.json(task);
};
