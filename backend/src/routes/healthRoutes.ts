import { Router } from 'express';
import { health } from '../controllers/health.controller';

const router = Router();
router.get('/health', health);
router.get('/ready', async (_req, res) => {
  try {
    res.status(200).json({ status: 'READY' });
  } catch {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

export default router;
