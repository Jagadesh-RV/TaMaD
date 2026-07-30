import { Server, Socket } from 'socket.io';
import MeetingChat from '../models/MeetingChat';
import MeetingReaction from '../models/MeetingReaction';

const meetingPresence = new Map<string, Set<string>>(); // meetingId -> Set of userIds

export const handleMeetingSockets = (io: Server, socket: Socket) => {
  socket.on('meeting_join', (data: { meetingId: string, userId: string }) => {
    const { meetingId, userId } = data;
    socket.join(`meeting_${meetingId}`);
    
    if (!meetingPresence.has(meetingId)) {
      meetingPresence.set(meetingId, new Set());
    }
    meetingPresence.get(meetingId)!.add(userId);
    
    // Broadcast updated presence list
    io.to(`meeting_${meetingId}`).emit('meeting_presence_update', Array.from(meetingPresence.get(meetingId)!));
  });

  socket.on('meeting_leave', (data: { meetingId: string, userId: string }) => {
    const { meetingId, userId } = data;
    socket.leave(`meeting_${meetingId}`);
    
    if (meetingPresence.has(meetingId)) {
      meetingPresence.get(meetingId)!.delete(userId);
      io.to(`meeting_${meetingId}`).emit('meeting_presence_update', Array.from(meetingPresence.get(meetingId)!));
    }
  });

  socket.on('meeting_chat', async (data: { meetingId: string, senderId: string, message: string }) => {
    try {
      const chat = await MeetingChat.create({
        meetingId: data.meetingId,
        senderId: data.senderId,
        message: data.message
      });
      io.to(`meeting_${data.meetingId}`).emit('meeting_chat_received', chat);
    } catch (e) {
      console.error('Socket chat error', e);
    }
  });

  socket.on('meeting_reaction', async (data: { meetingId: string, userId: string, emoji: string }) => {
    try {
      const reaction = await MeetingReaction.create({
        meetingId: data.meetingId,
        userId: data.userId,
        emoji: data.emoji
      });
      io.to(`meeting_${data.meetingId}`).emit('meeting_reaction_received', reaction);
    } catch (e) {
      console.error('Socket reaction error', e);
    }
  });

  socket.on('meeting_notes_update', (data: { meetingId: string, content: string }) => {
    // Broadcast notes update to others in meeting, except sender
    socket.to(`meeting_${data.meetingId}`).emit('meeting_notes_updated', data);
  });
};
