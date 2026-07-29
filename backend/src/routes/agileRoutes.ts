import { Router } from 'express';
import {
  getEpics, createEpic, updateEpic, deleteEpic,
  getSprints, createSprint, updateSprint, deleteSprint,
  startSprint, completeSprint
} from '../controllers/agileController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.route('/epics')
  .get(getEpics)
  .post(createEpic);
router.route('/epics/:id')
  .put(updateEpic)
  .delete(deleteEpic);

router.route('/sprints')
  .get(getSprints)
  .post(createSprint);
router.route('/sprints/:id')
  .put(updateSprint)
  .delete(deleteSprint);

router.post('/sprints/:id/start', startSprint);
router.post('/sprints/:id/complete', completeSprint);

export default router;
