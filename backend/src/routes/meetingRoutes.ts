import express from 'express';
import { protect } from '../middleware/auth';
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  joinMeeting,
  endMeeting
} from '../controllers/meetingController';

const router = express.Router();

router.use(protect);

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.post('/:id/join', joinMeeting);
router.post('/:id/end', endMeeting);

export default router;
