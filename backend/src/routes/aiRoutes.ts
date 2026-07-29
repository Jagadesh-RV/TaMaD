import { Router } from 'express';
import {
  parseTask,
  chatWithWorkspace,
  generateWeeklySummary,
  generateProjectPlanHandler,
  generateDailyPlanHandler,
  generateEmbeddingHandler,
  searchWithAI,
} from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/parse-task', parseTask);
router.post('/chat', chatWithWorkspace);
router.post('/weekly-summary', generateWeeklySummary);
router.post('/project-plan', generateProjectPlanHandler);
router.post('/daily-plan', generateDailyPlanHandler);
router.post('/embeddings', generateEmbeddingHandler);
router.post('/search', searchWithAI);

export default router;
