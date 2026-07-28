import { Router } from 'express';
import { getWhiteboards, getWhiteboardById, createWhiteboard, updateWhiteboard, deleteWhiteboard } from '../controllers/whiteboardController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { whiteboardCreateSchema, whiteboardUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);

router.route('/')
  .get(getWhiteboards)
  .post(validate(whiteboardCreateSchema), createWhiteboard);

router.route('/:id')
  .get(getWhiteboardById)
  .put(validate(whiteboardUpdateSchema), updateWhiteboard)
  .delete(deleteWhiteboard);

export default router;
