import cron from 'node-cron';
import logger from './logger';
import { cache } from './cache';
import { queueService } from '../services/queue';
import { registerQueueHandlers } from '../services/queue/handlers';
import AutomationWorkflow from '../services/automation/models/AutomationWorkflow';
import AutomationExecution from '../services/automation/models/AutomationExecution';
import Notification from '../models/Notification';
import User from '../models/User';
import Task from '../models/Task';

const cleanupExpiredSessions = async () => {
  try {
    const result = await User.updateMany(
      { 'sessions.expiresAt': { $lt: new Date() } },
      { $pull: { sessions: { expiresAt: { $lt: new Date() } } } }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Cleaned up expired sessions from ${result.modifiedCount} users`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error);
  }
};

const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true,
    });
    if (result.deletedCount > 0) {
      logger.info(`Deleted ${result.deletedCount} old notifications`);
    }
  } catch (error) {
    logger.error('Error cleaning up old notifications:', error);
  }
};

const cleanupStaleCache = async () => {
  try {
    await cache.invalidatePattern('*');
    logger.debug('Cache cleanup completed');
  } catch (error) {
    logger.error('Error checking cache:', error);
  }
};

const checkOverdueTasks = async () => {
  try {
    const overdueTasks = await Task.find({
      dueDate: { $lt: new Date() },
      status: { $nin: ['done', 'archived'] },
      isArchived: false,
    }).populate('assignees', 'name email');

    if (overdueTasks.length > 0) {
      logger.info(`Found ${overdueTasks.length} overdue tasks`);
      for (const task of overdueTasks) {
        for (const assignee of task.assignees) {
          const assigneeObj = assignee as unknown as { _id: string; name: string };
          await queueService.addJob('reminders', {
            type: 'task.overdue',
            taskId: task._id.toString(),
            taskTitle: task.title,
            userId: assigneeObj._id,
            userName: assigneeObj.name,
          });
        }
      }
    }
  } catch (error) {
    logger.error('Error checking overdue tasks:', error);
  }
};

const cleanupOldExecutions = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await AutomationExecution.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    });
    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} old automation executions`);
    }
  } catch (error) {
    logger.error('Error cleaning up old automation executions:', error);
  }
};

const generateAnalyticsSnapshot = async () => {
  try {
    const taskCount = await Task.countDocuments();
    const overdueCount = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ['done', 'archived'] },
      isArchived: false,
    });
    logger.info(`Analytics snapshot: ${taskCount} total tasks, ${overdueCount} overdue`);
  } catch (error) {
    logger.error('Error generating analytics snapshot:', error);
  }
};

export const startBackgroundJobs = () => {
  queueService.initialize();
  registerQueueHandlers();

  cron.schedule('0 * * * *', cleanupExpiredSessions);
  cron.schedule('0 2 * * *', cleanupOldNotifications);
  cron.schedule('*/5 * * * *', cleanupStaleCache);
  cron.schedule('0 9 * * *', checkOverdueTasks);
  cron.schedule('0 3 * * *', cleanupOldExecutions);
  cron.schedule('*/30 * * * *', generateAnalyticsSnapshot);

  logger.info('Background jobs scheduled with BullMQ queue service');
};
