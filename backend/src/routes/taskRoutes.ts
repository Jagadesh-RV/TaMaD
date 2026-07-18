import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, reorderTask, bulkUpdateTasks, bulkDeleteTasks } from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // All task routes require authentication

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/bulk')
  .put(bulkUpdateTasks)
  .delete(bulkDeleteTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.put('/:id/reorder', reorderTask);

export default router;
