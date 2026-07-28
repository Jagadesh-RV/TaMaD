import { Router } from 'express';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../controllers/milestoneController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { milestoneCreateSchema, milestoneUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);

router.route('/')
  .get(getMilestones)
  .post(validate(milestoneCreateSchema), createMilestone);

router.route('/:id')
  .put(validate(milestoneUpdateSchema), updateMilestone)
  .delete(deleteMilestone);

export default router;
