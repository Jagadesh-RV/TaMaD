import { Router } from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .delete(deleteAllNotifications);

router.patch('/read-all', markAllRead);

router.route('/:id')
  .patch(markRead)
  .delete(deleteNotification);

export default router;
