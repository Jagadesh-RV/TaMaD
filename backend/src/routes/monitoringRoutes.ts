import { Router, Request, Response } from 'express';
import { getHealthStatus } from '../utils/monitoring';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: 'Health check failed' });
  }
});

router.get('/health/simple', async (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/stats', protect, async (req: AuthRequest, res: Response) => {
  const health = await getHealthStatus();
  res.json({
    uptime: health.uptime,
    memory: health.services.memory,
    cpu: health.services.cpu,
    database: health.services.database,
    redis: health.services.redis,
    queues: health.services.queues,
  });
});

export default router;
