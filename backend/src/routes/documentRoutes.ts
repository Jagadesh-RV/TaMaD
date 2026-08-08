import { Router } from 'express';
import { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } from '../controllers/documentController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';

const router = Router();

router.use(protect);
router.use(requireWorkspaceMember);

router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
