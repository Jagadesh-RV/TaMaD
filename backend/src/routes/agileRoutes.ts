import { Router } from 'express';
import {
  getEpics, createEpic, updateEpic, deleteEpic,
  getSprints, createSprint, updateSprint, deleteSprint,
  startSprint, completeSprint
} from '../controllers/agileController';
import { protect } from '../middleware/auth';
import Epic from '../models/Epic';
import Sprint from '../models/Sprint';
import { requireWorkspaceMember, requireEntityWorkspaceMember } from '../middleware/workspaceAuth';

const router = Router();
router.use(protect);

router.route('/epics')
  .get(requireWorkspaceMember, getEpics)
  .post(requireWorkspaceMember, createEpic);
router.route('/epics/:id')
  .put(requireEntityWorkspaceMember(Epic), updateEpic)
  .delete(requireEntityWorkspaceMember(Epic), deleteEpic);

router.route('/sprints')
  .get(requireWorkspaceMember, getSprints)
  .post(requireWorkspaceMember, createSprint);
router.route('/sprints/:id')
  .put(requireEntityWorkspaceMember(Sprint), updateSprint)
  .delete(requireEntityWorkspaceMember(Sprint), deleteSprint);

router.post('/sprints/:id/start', requireEntityWorkspaceMember(Sprint), startSprint);
router.post('/sprints/:id/complete', requireEntityWorkspaceMember(Sprint), completeSprint);



export default router;
