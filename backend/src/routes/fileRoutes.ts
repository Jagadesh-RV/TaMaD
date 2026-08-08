import { Router } from 'express';
import {
  getFiles, getFileById, createFile, updateFile,
  archiveFile, restoreFile, deleteFile, getFileStats,
} from '../controllers/fileController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';

const router = Router();

router.use(protect);
router.use(requireWorkspaceMember);

router.get('/stats', getFileStats);
router.get('/', getFiles);
router.get('/:id', getFileById);
router.post('/', createFile);
router.put('/:id', updateFile);
router.put('/:id/archive', archiveFile);
router.put('/:id/restore', restoreFile);
router.delete('/:id', deleteFile);

export default router;
