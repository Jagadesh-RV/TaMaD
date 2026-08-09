import { Router } from 'express';
import {
  getSummary, getTrend, getPriorityBreakdown, getHeatmap,
  getTagDistribution, exportCSV, getWeeklyReport,
} from '../controllers/analyticsController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';

const router = Router();

router.use(protect);
router.use(requireWorkspaceMember);

router.get('/summary', getSummary);
router.get('/trend', getTrend);
router.get('/priority', getPriorityBreakdown);
router.get('/heatmap', getHeatmap);
router.get('/tags', getTagDistribution);
router.get('/export/csv', exportCSV);
router.get('/weekly', getWeeklyReport);

export default router;
