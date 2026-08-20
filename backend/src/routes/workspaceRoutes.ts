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
import { requireWorkspaceMember, requireWorkspaceRole } from '../middleware/workspaceAuth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(validate(workspaceCreateSchema), createWorkspace);

router.route('/:id')
  .get(requireWorkspaceMember, getWorkspaceById)
  .put(requireWorkspaceMember, requireWorkspaceRole(['owner', 'admin']), validate(workspaceUpdateSchema), updateWorkspace)
  .delete(requireWorkspaceMember, requireWorkspaceRole(['owner']), deleteWorkspace);

router.get('/:id/stats', requireWorkspaceMember, getWorkspaceStats);

router.post('/:id/members', requireWorkspaceMember, requireWorkspaceRole(['owner', 'admin']), addMember);
router.put('/:id/members/role', requireWorkspaceMember, requireWorkspaceRole(['owner']), updateMemberRole);
router.delete('/:id/members/:userId', requireWorkspaceMember, requireWorkspaceRole(['owner', 'admin']), removeMember);

export default router;
