import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { handleMeetingSockets } from './meetingSocket';

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
  io.use((socket, next) => {
    let token = socket.handshake.auth.token;

    // The client cannot read the HttpOnly token, so it might pass user ID or undefined.
    // Let's check cookies if the provided token isn't a valid JWT (or is missing)
    if ((!token || token.split('.').length !== 3) && socket.request.headers.cookie) {
      const cookieStr = socket.request.headers.cookie;
      const cookies = cookieStr.split(';').reduce((acc, str) => {
        const parts = str.split('=');
        if (parts.length >= 2) {
          acc[parts[0].trim()] = decodeURIComponent(parts[1].trim());
        }
        return acc;
      }, {} as Record<string, string>);
      token = cookies.tamad_access_token || token;
    }

    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user.id;
    console.log(`User connected: ${userId}`);

    handleMeetingSockets(io, socket);

    socket.join(`user_${userId}`);

    // Track which workspaces this socket has joined for disconnect cleanup
    const joinedWorkspaces = new Set<string>();

    // Join a workspace room
    socket.on('join_workspace', (workspaceId: string) => {
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
      socket.to(`workspace_${workspaceId}`).emit('user_typing', {
        userId,
        taskId
      });
    });

    socket.on('typing_end', ({ workspaceId, taskId }) => {
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

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
