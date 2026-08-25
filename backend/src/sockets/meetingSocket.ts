import { Server, Socket } from 'socket.io';
import MeetingChat from '../models/MeetingChat';
import MeetingReaction from '../models/MeetingReaction';

import MeetingParticipant from '../models/MeetingParticipant';

const meetingPresence = new Map<string, Set<string>>(); // meetingId -> Set of userIds

export const handleMeetingSockets = (io: Server, socket: Socket) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (socket as any).user.id;
  const joinedMeetings = new Set<string>();

  socket.on('meeting_join', async (data: { meetingId: string }) => {
    try {
      const { meetingId } = data;
      
      const participant = await MeetingParticipant.findOne({ meetingId, userId, status: { $in: ['joined', 'accepted'] } });
      if (!participant) {
        console.log(`User ${userId} attempted to join unauthorized meeting ${meetingId}`);
        return;
      }

      socket.join(`meeting_${meetingId}`);
      joinedMeetings.add(meetingId);
      
      if (!meetingPresence.has(meetingId)) {
        meetingPresence.set(meetingId, new Set());
      }
      meetingPresence.get(meetingId)!.add(userId);
      
      io.to(`meeting_${meetingId}`).emit('meeting_presence_update', Array.from(meetingPresence.get(meetingId)!));
    } catch (e) {
      console.error('Socket meeting join error', e);
    }
  });

  socket.on('meeting_leave', (data: { meetingId: string }) => {
    const { meetingId } = data;
    socket.leave(`meeting_${meetingId}`);
    joinedMeetings.delete(meetingId);
    
    if (meetingPresence.has(meetingId)) {
      meetingPresence.get(meetingId)!.delete(userId);
      io.to(`meeting_${meetingId}`).emit('meeting_presence_update', Array.from(meetingPresence.get(meetingId)!));
    }
  });

  socket.on('meeting_chat', async (data: { meetingId: string, message: string }) => {
    if (!joinedMeetings.has(data.meetingId)) return;
    try {
      const chat = await MeetingChat.create({
        meetingId: data.meetingId,
        senderId: userId,
        message: data.message
      });
      io.to(`meeting_${data.meetingId}`).emit('meeting_chat_received', chat);
    } catch (e) {
      console.error('Socket chat error', e);
    }
  });

  socket.on('meeting_reaction', async (data: { meetingId: string, emoji: string }) => {
    if (!joinedMeetings.has(data.meetingId)) return;
    try {
      const reaction = await MeetingReaction.create({
        meetingId: data.meetingId,
        userId: userId,
        emoji: data.emoji
      });
      io.to(`meeting_${data.meetingId}`).emit('meeting_reaction_received', reaction);
    } catch (e) {
      console.error('Socket reaction error', e);
    }
  });

  socket.on('meeting_notes_update', (data: { meetingId: string, content: string }) => {
    if (!joinedMeetings.has(data.meetingId)) return;
    socket.to(`meeting_${data.meetingId}`).emit('meeting_notes_updated', data);
  });
};
