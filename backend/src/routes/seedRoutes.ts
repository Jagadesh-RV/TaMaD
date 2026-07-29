import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { seedDatabase } from '../utils/seed';
import logger from '../utils/logger';

const router = Router();

router.post('/seed', protect, async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Seeding is not allowed in production' });
    }
    await seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    logger.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

export default router;
