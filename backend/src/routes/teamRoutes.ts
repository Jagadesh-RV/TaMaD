import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  createTeam, getTeams, getTeamById, updateTeam, deleteTeam,
  getMembers, inviteMember, joinTeam, leaveTeam, updateMemberRole, removeMember
} from '../controllers/teamController';

const router = Router();

router.use(protect);

router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);

router.get('/:id/members', getMembers);
router.patch('/:id/members/:memberId', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/invite', inviteMember);
router.post('/:id/leave', leaveTeam);

// Global join route
router.post('/join', joinTeam);

export default router;
