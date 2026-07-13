import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .put(updateNote)
  .delete(deleteNote);

export default router;
