import { Router } from 'express';
import { getDashboard, updateDashboard } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

import { requireWorkspaceMember, requireEntityWorkspaceMember } from '../middleware/workspaceAuth';
import Dashboard from '../models/Dashboard';

const router = Router();
router.use(protect);

router.route('/')
  .get(requireWorkspaceMember, getDashboard);

router.route('/:id')
  .put(requireEntityWorkspaceMember(Dashboard), updateDashboard);

export default router;
