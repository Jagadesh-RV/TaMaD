import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';
import { validate } from '../middleware/validate';
import { noteCreateSchema, noteUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);
router.use(requireWorkspaceMember);

router.route('/')
  .get(getNotes)
  .post(validate(noteCreateSchema), createNote);

router.route('/:id')
  .put(validate(noteUpdateSchema), updateNote)
  .delete(deleteNote);

export default router;
