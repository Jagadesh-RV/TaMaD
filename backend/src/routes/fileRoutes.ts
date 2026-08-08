import { Router } from 'express';
import {
  getFiles, getFileById, createFile, updateFile,
  archiveFile, restoreFile, deleteFile, getFileStats,
  generateUploadUrl, generateDownloadUrl
} from '../controllers/fileController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember, requireEntityWorkspaceMember } from '../middleware/workspaceAuth';
import File from '../models/File';

const router = Router();

router.use(protect);

router.get('/stats', requireWorkspaceMember, getFileStats);
router.get('/', requireWorkspaceMember, getFiles);
router.post('/', requireWorkspaceMember, createFile);
router.post('/upload-url', requireWorkspaceMember, generateUploadUrl);

router.use('/:id', requireEntityWorkspaceMember(File));

router.get('/:id', getFileById);
router.get('/:id/download-url', generateDownloadUrl);
router.put('/:id', updateFile);
router.put('/:id/archive', archiveFile);
router.put('/:id/restore', restoreFile);
router.delete('/:id', deleteFile);

export default router;
