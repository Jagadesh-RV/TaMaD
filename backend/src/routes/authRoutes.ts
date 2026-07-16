import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, forgotPassword, resetPassword, getMe, updateProfile, getSessions } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

router.use(authLimiter);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/sessions', protect, getSessions);

export default router;
