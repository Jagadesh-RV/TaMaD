import { Router } from 'express';
import {
  getFocusSessions, createFocusSession, completeFocusSession, getFocusStats,
} from '../controllers/focusSessionController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/stats', getFocusStats);
router.get('/', getFocusSessions);
router.post('/', createFocusSession);
router.put('/:id/complete', completeFocusSession);

export default router;
