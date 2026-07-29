import { Router } from 'express';
import { getDashboard, updateDashboard } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.route('/')
  .get(getDashboard);

router.route('/:id')
  .put(updateDashboard);

export default router;
