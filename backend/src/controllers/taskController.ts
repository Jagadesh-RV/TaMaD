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
