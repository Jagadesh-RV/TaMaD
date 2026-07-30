import { Server, Socket } from 'socket.io';
import { updateParticipantSocket } from '../services/tamad-meet/meetingRoomService';
import logger from '../utils/logger';

export const initTamadMeetSocket = (io: Server) => {
  const namespace = io.of('/socket/tamad-meet');

  namespace.on('connection', (socket: Socket) => {
    logger.info(`TaMaD Meet User connected: ${socket.id}`);

    socket.on('join-room', async (data: { roomId: string, participantId: string }) => {
      try {
        socket.join(data.roomId);
        await updateParticipantSocket(data.participantId as any, socket.id);
        
        socket.to(data.roomId).emit('participant-joined', { participantId: data.participantId, socketId: socket.id });
        logger.info(`Participant ${data.participantId} joined room ${data.roomId}`);
      } catch (err) {
        logger.error('Error joining room', err);
      }
    });

    socket.on('offer', (data: { target: string, offer: any, callerId: string }) => {
      socket.to(data.target).emit('offer', {
        offer: data.offer,
        callerId: data.callerId,
        callerSocketId: socket.id
      });
    });

    socket.on('answer', (data: { target: string, answer: any, calleeId: string }) => {
      socket.to(data.target).emit('answer', {
        answer: data.answer,
        calleeId: data.calleeId,
        calleeSocketId: socket.id
      });
    });

    socket.on('ice-candidate', (data: { target: string, candidate: any, senderId: string }) => {
      socket.to(data.target).emit('ice-candidate', {
        candidate: data.candidate,
        senderId: data.senderId,
        senderSocketId: socket.id
      });
    });
    
    socket.on('chat-message', (data: { roomId: string, message: any }) => {
      namespace.to(data.roomId).emit('chat-message', data.message);
    });

    socket.on('disconnect', () => {
      logger.info(`TaMaD Meet User disconnected: ${socket.id}`);
      // Ideally broadcast participant-left to the room they were in
    });
  });
};
