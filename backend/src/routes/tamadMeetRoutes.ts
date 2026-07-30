import express from 'express';
import { protect } from '../middleware/auth';
import { createMeeting, getMeetings, getMeeting, joinRoom } from '../controllers/tamad-meet/meetingEngineController';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createMeeting)
  .get(getMeetings);

router.route('/:id')
  .get(getMeeting);

router.post('/room/:roomId/join', joinRoom);

export default router;
