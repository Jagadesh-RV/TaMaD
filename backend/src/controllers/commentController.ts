// @ts-nocheck
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Comment from '../models/Comment';
import { getIO } from '../sockets/socketManager';
import { createAuditLog } from '../utils/auditLogger';
import Task from '../models/Task';

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
export const getComments = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;

  const comments = await Comment.find({ taskId })
    .populate('userId', 'name email avatarUrl')
    .populate('mentions', 'name')
    .sort({ createdAt: -1 });

  res.json(comments);
};

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
export const addComment = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const { content, mentions } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const comment = await Comment.create({
    taskId,
    userId: req.user._id,
    content,
    mentions: mentions || [],
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('userId', 'name email avatarUrl')
    .populate('mentions', 'name');

  // Broadcast via socket
  getIO().to(`workspace_${task.workspaceId}`).emit('comment_added', populatedComment);

  // Generate audit log for the comment
  await createAuditLog(
    task.workspaceId.toString(),
    req.user._id,
    'commented on task',
    'Task',
    task._id.toString(),
    { commentId: comment._id.toString() }
  );

  res.status(201).json(populatedComment);
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req: AuthRequest, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  // Allow deletion if the user is the comment author
  if (comment.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to delete this comment' });
  }

  const task = await Task.findById(comment.taskId);

  await comment.deleteOne();

  if (task) {
    getIO().to(`workspace_${task.workspaceId}`).emit('comment_deleted', { commentId: req.params.id, taskId: task._id });
  }

  res.json({ message: 'Comment deleted' });
};
