// @ts-nocheck
import TamadMeetMeeting from '../../models/tamad-meet/TamadMeetMeeting';
import TamadMeetRoom from '../../models/tamad-meet/TamadMeetRoom';
import TamadMeetParticipant from '../../models/tamad-meet/TamadMeetParticipant';
import mongoose from 'mongoose';
import crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createEngineMeeting = async (payload: any, hostId: mongoose.Types.ObjectId) => {
  const meeting = await TamadMeetMeeting.create({
    title: payload.title,
    description: payload.description,
    teamId: payload.teamId,
    workspaceId: payload.workspaceId,
    hostId,
    startTime: new Date(payload.startTime),
    duration: payload.duration,
    meetingType: payload.meetingType,
    createdBy: hostId,
    updatedBy: hostId,
    status: 'scheduled',
    participants: payload.participants || []
  });

  const roomId = `tm-${crypto.randomBytes(6).toString('hex')}`;
  const meetingCode = crypto.randomBytes(4).toString('hex');
  
  await TamadMeetRoom.create({
    meetingId: meeting._id,
    roomId,
    meetingCode,
    isLocked: false,
    waitingRoomEnabled: true
  });

  await TamadMeetParticipant.create({
    meetingId: meeting._id,
    userId: hostId,
    role: 'host',
    status: 'accepted'
  });

  if (payload.participants && Array.isArray(payload.participants)) {
    const participantDocs = payload.participants.map((userId: string) => ({
      meetingId: meeting._id,
      userId: new mongoose.Types.ObjectId(userId),
      role: 'member',
      status: 'pending' // pending until they join or accept
    }));
    if (participantDocs.length > 0) {
      await TamadMeetParticipant.insertMany(participantDocs);
    }
  }

  return meeting;
};

export const getMeetingsByTeam = async (teamId: string) => {
  return await TamadMeetMeeting.find({ teamId }).sort({ startTime: -1 });
};

export const getMeetingDetails = async (meetingId: string) => {
  return await TamadMeetMeeting.findById(meetingId);
};
