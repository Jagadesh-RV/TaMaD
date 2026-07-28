import { Router } from 'express';
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
  getWorkspaceStats,
} from '../controllers/workspaceController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { workspaceCreateSchema, workspaceUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(validate(workspaceCreateSchema), createWorkspace);

router.route('/:id')
  .get(getWorkspaceById)
  .put(validate(workspaceUpdateSchema), updateWorkspace)
  .delete(deleteWorkspace);

router.get('/:id/stats', getWorkspaceStats);

router.post('/:id/members', addMember);
router.put('/:id/members/role', updateMemberRole);
router.delete('/:id/members/:userId', removeMember);

export default router;
