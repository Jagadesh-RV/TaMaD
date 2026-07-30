import express from 'express';
import { protect } from '../middleware/auth';
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  joinMeeting,
  endMeeting,
  updateMeeting,
  deleteMeeting,
  cancelMeeting,
  duplicateMeeting,
  inviteMember,
  respondToInvitation
} from '../controllers/meetingController';

const router = express.Router();

router.use(protect);

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.patch('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/:id/join', joinMeeting);
router.post('/:id/end', endMeeting);
router.post('/:id/cancel', cancelMeeting);
router.post('/:id/duplicate', duplicateMeeting);
router.post('/:id/invite', inviteMember);
router.post('/:id/respond', respondToInvitation);

export default router;
