import { Router } from 'express';
import { getWhiteboards, getWhiteboardById, createWhiteboard, updateWhiteboard, deleteWhiteboard } from '../controllers/whiteboardController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getWhiteboards)
  .post(createWhiteboard);

router.route('/:id')
  .get(getWhiteboardById)
  .put(updateWhiteboard)
  .delete(deleteWhiteboard);

export default router;
