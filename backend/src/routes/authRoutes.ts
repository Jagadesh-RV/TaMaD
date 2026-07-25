import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createFirebaseSession, refresh, logout, getMe, updateProfile, getSessions } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

router.use(authLimiter);
router.post('/firebase/session', createFirebaseSession);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/sessions', protect, getSessions);

export default router;
