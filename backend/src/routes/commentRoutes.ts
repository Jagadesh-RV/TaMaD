import { Router } from 'express';
import { deleteComment } from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.delete('/:id', deleteComment);

export default router;
