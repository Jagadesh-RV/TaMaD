import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createFirebaseSession,
  refresh,
  logout,
  logoutAll,
  getMe,
  syncEmailVerification,
  updateProfile,
  changePassword,
  deleteAccount,
  getSessions,
  revokeSession,
  getWorkspace,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, please try again later.' },
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});

// Public
router.post('/firebase/session', authLimiter, createFirebaseSession);
router.post('/refresh', refresh);

// Protected
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getMe);
router.get('/workspace', protect, getWorkspace);
router.post('/sync-verification', protect, syncEmailVerification);
router.put('/profile', protect, updateProfile);
router.get('/sessions', protect, getSessions);
router.post('/sessions/revoke', protect, revokeSession);

// Sensitive operations - stricter rate limit
router.use('/change-password', strictAuthLimiter);
router.post('/change-password', protect, changePassword);
router.post('/delete-account', strictAuthLimiter, protect, deleteAccount);

export default router;
