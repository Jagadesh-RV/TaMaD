import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Meeting from '../models/Meeting';
import MeetingParticipant from '../models/MeetingParticipant';
import TeamMember from '../models/TeamMember';
import { createMeetingRoom, generateParticipantToken, deleteRoom } from '../services/meetingService';
import { triggerN8NMeetingWorkflow, generateMockAISummary } from '../services/meetingAutomationService';
import mongoose from 'mongoose';
import { io } from '../index';
import crypto from 'crypto';

export const createMeeting = async (req: AuthRequest, res: Response) => {
  const { title, description, teamId, workspaceId, startTime, duration, meetingType, participants } = req.body;
  const hostId = req.user?._id;

  try {
    const isMember = await TeamMember.findOne({ teamId, userId: hostId, isDeleted: false });
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    const roomName = `room-${crypto.randomBytes(8).toString('hex')}`;
    
    const meeting = await Meeting.create({
      title,
      description,
      teamId,
      workspaceId,
      hostId,
      roomName,
      startTime: new Date(startTime),
      duration,
      meetingType,
      createdBy: hostId,
      updatedBy: hostId,
      status: 'scheduled'
    });

    // Add host as participant
    await MeetingParticipant.create({
      meetingId: meeting._id,
      userId: hostId,
      role: 'host',
      status: 'accepted'
    });

    // Add other participants
    if (participants && Array.isArray(participants)) {
      const participantDocs = participants.map(p => ({
        meetingId: meeting._id,
        userId: p,
        role: 'participant',
        status: 'invited',
        invitedBy: hostId
      }));
      await MeetingParticipant.insertMany(participantDocs);
    }

    await triggerN8NMeetingWorkflow('MEETING_SCHEDULED', { meetingId: meeting._id, title, teamId });
    io.to(`team_${teamId}`).emit('meeting_created', meeting);

    res.status(201).json({ message: 'Meeting scheduled successfully', meeting });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to schedule meeting' });
  }
};

export const getMeetings = async (req: AuthRequest, res: Response) => {
  const { teamId } = req.query;
  try {
    const query: any = {};
    if (teamId) query.teamId = teamId;
    
    // Default to fetching for user's teams if teamId not provided
    if (!teamId) {
      const memberships = await TeamMember.find({ userId: req.user?._id, isDeleted: false });
      query.teamId = { $in: memberships.map(m => m.teamId) };
    }

    const meetings = await Meeting.find(query).sort({ startTime: -1 });
    res.json({ meetings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

export const getMeetingById = async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ meeting });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};

export const joinMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    let participant = await MeetingParticipant.findOne({ meetingId: meeting._id, userId: req.user?._id });
    
    // If not invited but team member, let them join as participant
    if (!participant) {
      const isMember = await TeamMember.findOne({ teamId: meeting.teamId, userId: req.user?._id, isDeleted: false });
      if (!isMember) return res.status(403).json({ error: 'Not authorized to join this meeting' });
      
      participant = await MeetingParticipant.create({
        meetingId: meeting._id,
        userId: req.user?._id,
        role: 'participant',
        status: 'joined',
        joinedAt: new Date()
      });
    } else {
      participant.status = 'joined';
      participant.joinedAt = new Date();
      await participant.save();
    }

    // Ensure LiveKit room exists
    if (meeting.status === 'scheduled') {
      await createMeetingRoom(meeting.roomName, meeting._id.toString());
      meeting.status = 'active';
      await meeting.save();
      await triggerN8NMeetingWorkflow('MEETING_STARTED', { meetingId: meeting._id });
      io.to(`team_${meeting.teamId}`).emit('meeting_started', meeting);
    }

    const token = generateParticipantToken(
      meeting.roomName, 
      req.user?.name || 'User', 
      req.user?._id?.toString() || 'anonymous', 
      participant.role
    );

    res.json({ token, roomName: meeting.roomName, meeting });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to join meeting' });
  }
};

export const endMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    
    if (meeting.hostId.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ error: 'Only host can end meeting' });
    }

    try {
      await deleteRoom(meeting.roomName);
    } catch (e) {
      console.log('LiveKit room might already be closed', e);
    }

    meeting.status = 'ended';
    meeting.endTime = new Date();
    await meeting.save();

    await MeetingParticipant.updateMany(
      { meetingId: meeting._id, status: 'joined' },
      { $set: { status: 'left', leftAt: new Date() } }
    );

    io.to(`team_${meeting.teamId}`).emit('meeting_ended', { meetingId: meeting._id });
    
    // Fire AI background job
    generateMockAISummary(meeting._id as mongoose.Types.ObjectId);

    res.json({ message: 'Meeting ended' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to end meeting' });
  }
};
