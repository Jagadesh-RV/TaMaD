import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, reorderTask, bulkUpdateTasks, bulkDeleteTasks, toggleWatchTask, toggleVoteTask } from '../controllers/taskController';
import { getComments, addComment } from '../controllers/commentController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember, requireEntityWorkspaceMember } from '../middleware/workspaceAuth';
import { validate } from '../middleware/validate';
import { taskCreateSchema, taskUpdateSchema } from '../middleware/schemas';
import Task from '../models/Task';

const router = Router();

router.use(protect); // All task routes require authentication
router.use(requireWorkspaceMember); // Require workspace membership for collection routes
router.use('/:id', requireEntityWorkspaceMember(Task));
router.use('/:taskId', requireEntityWorkspaceMember(Task));

router.route('/')
  .get(getTasks)
  .post(validate(taskCreateSchema), createTask);

router.route('/bulk')
  .put(bulkUpdateTasks)
  .delete(bulkDeleteTasks);

router.route('/:id')
  .put(validate(taskUpdateSchema), updateTask)
  .delete(deleteTask);

router.put('/:id/reorder', reorderTask);
router.post('/:id/watch', toggleWatchTask);
router.post('/:id/vote', toggleVoteTask);

router.route('/:taskId/comments')
  .get(getComments)
  .post(addComment);

export default router;
