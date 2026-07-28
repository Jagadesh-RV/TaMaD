import { Router } from 'express';
import { parseTask, chatWithWorkspace, generateWeeklySummary } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/parse-task', parseTask);
router.post('/chat', chatWithWorkspace);
router.post('/weekly-summary', generateWeeklySummary);

export default router;
