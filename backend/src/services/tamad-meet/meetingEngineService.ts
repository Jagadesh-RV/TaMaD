import TamadMeetMeeting from '../../models/tamad-meet/TamadMeetMeeting';
import TamadMeetRoom from '../../models/tamad-meet/TamadMeetRoom';
import TamadMeetParticipant from '../../models/tamad-meet/TamadMeetParticipant';
import mongoose from 'mongoose';
import crypto from 'crypto';

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
    status: 'scheduled'
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

  return meeting;
};

export const getMeetingsByTeam = async (teamId: string) => {
  return await TamadMeetMeeting.find({ teamId }).sort({ startTime: -1 });
};

export const getMeetingDetails = async (meetingId: string) => {
  return await TamadMeetMeeting.findById(meetingId);
};
