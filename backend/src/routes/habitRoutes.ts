import { Router } from 'express';
import { getHabits, createHabit, updateHabit, toggleHabitDate, deleteHabit } from '../controllers/habitController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';
import { validate } from '../middleware/validate';
import { habitCreateSchema, habitUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);
router.use(requireWorkspaceMember);

router.route('/')
  .get(getHabits)
  .post(validate(habitCreateSchema), createHabit);

router.route('/:id')
  .put(validate(habitUpdateSchema), updateHabit)
  .delete(deleteHabit);

router.put('/:id/toggle', toggleHabitDate);

export default router;
