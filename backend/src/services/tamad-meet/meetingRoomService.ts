import TamadMeetRoom from '../../models/tamad-meet/TamadMeetRoom';
import TamadMeetParticipant from '../../models/tamad-meet/TamadMeetParticipant';
import mongoose from 'mongoose';

export const getRoomByMeetingId = async (meetingId: mongoose.Types.ObjectId) => {
  return await TamadMeetRoom.findOne({ meetingId });
};

export const verifyRoomAccess = async (roomId: string, userId: mongoose.Types.ObjectId) => {
  const room = await TamadMeetRoom.findOne({ roomId });
  if (!room) {
    throw new Error('Room not found');
  }

  let participant = await TamadMeetParticipant.findOne({ meetingId: room.meetingId, userId });
  if (!participant) {
    // If room is locked, they can't join unless invited
    if (room.isLocked) {
      throw new Error('Room is locked');
    }
    
    // Create viewer/participant role for them
    participant = await TamadMeetParticipant.create({
      meetingId: room.meetingId,
      userId,
      role: 'participant',
      status: room.waitingRoomEnabled ? 'waiting' : 'joined'
    });
  }

  return { room, participant };
};

export const updateParticipantSocket = async (participantId: mongoose.Types.ObjectId, socketId: string) => {
  return await TamadMeetParticipant.findByIdAndUpdate(participantId, { socketId }, { new: true });
};
