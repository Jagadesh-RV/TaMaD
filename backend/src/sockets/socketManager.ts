import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { handleMeetingSockets } from './meetingSocket';
import { initTamadMeetSocket } from '../gateways/tamadMeetSocketGateway';
import { socketAuthMiddleware } from './socketAuth';
import { rateLimitMiddleware } from './rateLimiter';
import Workspace from '../models/Workspace';

let io: Server;

const workspacePresence = new Map<string, Set<string>>();

export const getPresence = (workspaceId: string): string[] => {
  return Array.from(workspacePresence.get(workspaceId) || []);
};

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use(socketAuthMiddleware);
  io.use(rateLimitMiddleware);

  io.on('connection', (socket: Socket) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (socket as any).user.id;
    console.log(`User connected: ${userId}`);

    handleMeetingSockets(io, socket);

    socket.join(`user_${userId}`);

    // Track which workspaces this socket has joined for disconnect cleanup
    const joinedWorkspaces = new Set<string>();

    // Join a workspace room
    socket.on('join_workspace', async (workspaceId: string) => {
      try {
        const workspace = await Workspace.findById(workspaceId).lean();
        if (!workspace) return;
        
        const isMember = workspace.members.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (m: any) => m.userId.toString() === userId.toString()
        );
        
        if (!isMember) {
          console.log(`User ${userId} attempted to join unauthorized workspace ${workspaceId}`);
          return;
        }

        socket.join(`workspace_${workspaceId}`);
        joinedWorkspaces.add(workspaceId);

        if (!workspacePresence.has(workspaceId)) {
          workspacePresence.set(workspaceId, new Set());
        }
        workspacePresence.get(workspaceId)!.add(userId);

        console.log(`User ${userId} joined workspace ${workspaceId}`);
        io.to(`workspace_${workspaceId}`).emit('presence_update', {
          workspaceId,
          users: Array.from(workspacePresence.get(workspaceId)!),
        });
      } catch (_error) {
        console.error('Error joining workspace socket room:', error);
      }
    });

    // Leave a workspace room
    socket.on('leave_workspace', (workspaceId: string) => {
      socket.leave(`workspace_${workspaceId}`);
      joinedWorkspaces.delete(workspaceId);

      const presence = workspacePresence.get(workspaceId);
      if (presence) {
        presence.delete(userId);
        if (presence.size === 0) {
          workspacePresence.delete(workspaceId);
        }
      }

      io.to(`workspace_${workspaceId}`).emit('presence_update', {
        workspaceId,
        users: Array.from(workspacePresence.get(workspaceId) || []),
      });
    });

    // Handle typing indicators
    socket.on('typing_start', ({ workspaceId, taskId }) => {
      if (!joinedWorkspaces.has(workspaceId)) return;
      socket.to(`workspace_${workspaceId}`).emit('user_typing', {
        userId,
        taskId
      });
    });

    socket.on('typing_end', ({ workspaceId, taskId }) => {
      if (!joinedWorkspaces.has(workspaceId)) return;
      socket.to(`workspace_${workspaceId}`).emit('user_stopped_typing', {
        userId,
        taskId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);

      // Remove user from all presence sets
      for (const workspaceId of joinedWorkspaces) {
        const presence = workspacePresence.get(workspaceId);
        if (presence) {
          presence.delete(userId);
          if (presence.size === 0) {
            workspacePresence.delete(workspaceId);
          }
        }
        io.to(`workspace_${workspaceId}`).emit('presence_update', {
          workspaceId,
          users: Array.from(workspacePresence.get(workspaceId) || []),
        });
      }
    });
  });

  initTamadMeetSocket(io);

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
