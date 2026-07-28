import cron from 'node-cron';
import logger from './logger';
import { cache } from './cache';
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
    }).populate('assignees', 'name');

    if (overdueTasks.length > 0) {
      logger.info(`Found ${overdueTasks.length} overdue tasks`);
    }
  } catch (error) {
    logger.error('Error checking overdue tasks:', error);
  }
};

export const startBackgroundJobs = () => {
  cron.schedule('0 * * * *', cleanupExpiredSessions);
  cron.schedule('0 2 * * *', cleanupOldNotifications);
  cron.schedule('*/5 * * * *', cleanupStaleCache);
  cron.schedule('0 9 * * *', checkOverdueTasks);

  logger.info('Background jobs scheduled');
};
