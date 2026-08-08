import { Router } from 'express';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';
import { validate } from '../middleware/validate';
import { goalCreateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);
router.use(requireWorkspaceMember);

router.route('/')
  .get(getGoals)
  .post(validate(goalCreateSchema), createGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

export default router;
