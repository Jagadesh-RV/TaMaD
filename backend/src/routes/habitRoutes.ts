import { Router } from 'express';
import { getHabits, createHabit, toggleHabitDate, deleteHabit } from '../controllers/habitController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .delete(deleteHabit);

router.put('/:id/toggle', toggleHabitDate);

export default router;
