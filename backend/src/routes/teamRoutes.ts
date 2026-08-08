import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireTeamMember, requireTeamRole } from '../middleware/teamAuth';
import { 
  createTeam, getTeams, getTeamById, updateTeam, deleteTeam,
  getMembers, inviteMember, joinTeam, leaveTeam, updateMemberRole, removeMember
} from '../controllers/teamController';

const router = Router();

router.use(protect);

router.post('/', createTeam);
router.get('/', getTeams);

// Global join route
router.post('/join', joinTeam);

// Protect all routes with :id parameter to require at least member access
router.use('/:id', requireTeamMember);

router.get('/:id', getTeamById);
router.patch('/:id', requireTeamRole(['Owner', 'Admin']), updateTeam);
router.delete('/:id', requireTeamRole(['Owner']), deleteTeam);

router.get('/:id/members', getMembers);
router.patch('/:id/members/:memberId', requireTeamRole(['Owner', 'Admin']), updateMemberRole);
router.delete('/:id/members/:memberId', requireTeamRole(['Owner', 'Admin']), removeMember);
router.post('/:id/invite', requireTeamRole(['Owner', 'Admin']), inviteMember);
router.post('/:id/leave', leaveTeam);

export default router;
