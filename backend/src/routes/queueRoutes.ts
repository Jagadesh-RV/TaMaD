import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { queueService } from '../services/queue';

const router = Router();
router.use(protect);

router.get('/metrics', async (_req: AuthRequest, res: Response) => {
  try {
    const metrics = await queueService.getAllQueueMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch queue metrics' });
  }
});

router.get('/metrics/:queueName', async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await queueService.getQueueMetrics(
      req.params.queueName as 'email' | 'ai-processing' | 'notifications'
    );
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch queue metrics' });
  }
});

router.post('/:queueName/pause', async (req: AuthRequest, res: Response) => {
  try {
    await queueService.pauseQueue(req.params.queueName as 'email');
    res.json({ message: `Queue ${req.params.queueName} paused` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pause queue' });
  }
});

router.post('/:queueName/resume', async (req: AuthRequest, res: Response) => {
  try {
    await queueService.resumeQueue(req.params.queueName as 'email');
    res.json({ message: `Queue ${req.params.queueName} resumed` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resume queue' });
  }
});

export default router;
