import { Server, Socket } from 'socket.io';
import { updateParticipantSocket, verifyRoomAccess } from '../services/tamad-meet/meetingRoomService';
import { socketAuthMiddleware } from '../sockets/socketAuth';
import { rateLimitMiddleware } from '../sockets/rateLimiter';
import logger from '../utils/logger';

export const initTamadMeetSocket = (io: Server) => {
  const namespace = io.of('/socket/tamad-meet');

  namespace.use(socketAuthMiddleware);
  namespace.use(rateLimitMiddleware);

  namespace.on('connection', (socket: Socket) => {
    const userId = (socket as any).user?.id as string;
    logger.info(`TaMaD Meet User connected: ${socket.id} (user ${userId})`);

    socket.on('join-room', async (data: { roomId: string, participantId: string }) => {
      try {
        // Never allow impersonation: the participant id must match the authenticated user.
        if (!userId || !data.participantId || data.participantId !== userId) {
          logger.warn(`User ${userId} attempted to join room as ${data.participantId}`);
          socket.emit('join-error', { error: 'Not authorized' });
          return;
        }

        // Verify the room exists and the user has access to it.
        const { room } = await verifyRoomAccess(data.roomId, userId as any);

        socket.join(data.roomId);
        await updateParticipantSocket(userId as any, socket.id);

        socket.to(data.roomId).emit('participant-joined', { participantId: data.participantId, socketId: socket.id });
        logger.info(`Participant ${data.participantId} joined room ${room.roomId}`);
      } catch (err: any) {
        logger.error('Error joining room', err);
        socket.emit('join-error', { error: err.message || 'Failed to join room' });
      }
    });

    socket.on('offer', (data: { target: string, offer: any, callerId: string }) => {
      // Only allow signaling between authenticated participants in this namespace.
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
      if (data.message && data.message.userId === userId) {
        namespace.to(data.roomId).emit('chat-message', data.message);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`TaMaD Meet User disconnected: ${socket.id}`);
    });
  });
};
