import { Router } from 'express';
import { parseTask, chatWithWorkspace } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // Secure AI endpoints

router.post('/parse-task', parseTask);
router.post('/chat', chatWithWorkspace);

export default router;
