// @ts-nocheck
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';
import { getIO } from '../sockets/socketManager';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '50', unreadOnly } = req.query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { userId: req.user._id };
  if (unreadOnly === 'true') query.read = false;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [notifications, unread, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Notification.countDocuments({ userId: req.user._id, read: false }),
    Notification.countDocuments(query),
  ]);

  res.json({
    notifications,
    unread,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const markRead = async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  await cache.del(CACHE_KEYS.NOTIFICATIONS_UNREAD(req.user._id));
  
  getIO().to(`user_${req.user._id}`).emit('notification_updated', {
    notificationId: notification._id,
    read: true,
  });
  
  res.json(notification);
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true } }
  );

  await cache.del(CACHE_KEYS.NOTIFICATIONS_UNREAD(req.user._id));
  
  getIO().to(`user_${req.user._id}`).emit('notification_read_all');
  
  res.json({ message: 'All notifications marked as read' });
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  await cache.del(CACHE_KEYS.NOTIFICATIONS_UNREAD(req.user._id));
  
  getIO().to(`user_${req.user._id}`).emit('notification_deleted', {
    notificationId: notification._id,
  });
  
  res.json({ message: 'Notification removed' });
};

export const deleteAllNotifications = async (req: AuthRequest, res: Response) => {
  await Notification.deleteMany({ userId: req.user._id });
  await cache.del(CACHE_KEYS.NOTIFICATIONS_UNREAD(req.user._id));
  res.json({ message: 'All notifications deleted' });
};

export const createNotification = async (
  userId: string,
  workspaceId: string,
  title: string,
  body: string,
  type: string = 'info',
  extra?: { entityId?: string; entityType?: string; link?: string; createdBy?: string }
) => {
  const notification = await Notification.create({
    userId,
    workspaceId,
    title,
    body,
    type,
    ...extra,
  });
  
  await cache.del(CACHE_KEYS.NOTIFICATIONS_UNREAD(userId));
  
  getIO().to(`user_${userId}`).emit('notification_created', {
    _id: notification._id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    entityId: notification.entityId,
    entityType: notification.entityType,
    link: notification.link,
    read: notification.read,
    createdAt: notification.createdAt,
  });
  
  return notification;
};
