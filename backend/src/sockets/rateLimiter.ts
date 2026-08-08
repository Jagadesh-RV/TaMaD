import { Socket } from 'socket.io';

const rateLimits = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 60000; // 1 minute
const MAX_EVENTS_PER_WINDOW = 120; // 2 events per second average

export const rateLimitMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  socket.use((packet, nextPacket) => {
    const socketId = socket.id;
    const now = Date.now();

    if (!rateLimits.has(socketId)) {
      rateLimits.set(socketId, { count: 1, lastReset: now });
      return nextPacket();
    }

    const limitData = rateLimits.get(socketId)!;

    if (now - limitData.lastReset > WINDOW_MS) {
      // Reset window
      limitData.count = 1;
      limitData.lastReset = now;
      return nextPacket();
    }

    limitData.count++;

    if (limitData.count > MAX_EVENTS_PER_WINDOW) {
      console.warn(`Socket ${socketId} exceeded rate limit on event: ${packet[0]}`);
      return nextPacket(new Error('Rate limit exceeded. Please slow down.'));
    }

    nextPacket();
  });
  
  socket.on('disconnect', () => {
    rateLimits.delete(socket.id);
  });
  
  next();
};
