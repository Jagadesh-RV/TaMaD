import { Router } from 'express';
import { parseTask, chatWithWorkspace, generateWeeklySummary } from '../controllers/aiController';
import { protect } from '../middleware/auth';

import { requireWorkspaceMember } from '../middleware/workspaceAuth';

const router = Router();

router.use(protect);

router.post('/parse-task', parseTask);
router.post('/chat', requireWorkspaceMember, chatWithWorkspace);
router.post('/weekly-summary', requireWorkspaceMember, generateWeeklySummary);

export default router;
