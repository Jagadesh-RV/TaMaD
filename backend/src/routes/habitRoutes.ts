import { Router } from 'express';
import { getHabits, createHabit, toggleHabitDate, deleteHabit } from '../controllers/habitController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { habitCreateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);

router.route('/')
  .get(getHabits)
  .post(validate(habitCreateSchema), createHabit);

router.route('/:id')
  .delete(deleteHabit);

router.put('/:id/toggle', toggleHabitDate);

export default router;
