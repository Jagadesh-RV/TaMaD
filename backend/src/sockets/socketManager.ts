import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

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
    const token = socket.handshake.auth.token;
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
    console.log(`User connected: ${(socket as any).user.id}`);

    // Join a workspace room
    socket.on('join_workspace', (workspaceId: string) => {
      socket.join(`workspace_${workspaceId}`);
      console.log(`User ${(socket as any).user.id} joined workspace ${workspaceId}`);
    });

    // Leave a workspace room
    socket.on('leave_workspace', (workspaceId: string) => {
      socket.leave(`workspace_${workspaceId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', ({ workspaceId, taskId }) => {
      socket.to(`workspace_${workspaceId}`).emit('user_typing', {
        userId: (socket as any).user.id,
        taskId
      });
    });

    socket.on('typing_end', ({ workspaceId, taskId }) => {
      socket.to(`workspace_${workspaceId}`).emit('user_stopped_typing', {
        userId: (socket as any).user.id,
        taskId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${(socket as any).user.id}`);
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
