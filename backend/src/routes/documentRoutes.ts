import { Router } from 'express';
import { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } from '../controllers/documentController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
