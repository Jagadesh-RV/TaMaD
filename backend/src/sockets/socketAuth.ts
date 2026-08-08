import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, str) => {
    const parts = str.split('=');
    if (parts.length >= 2) {
      acc[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    }
    return acc;
  }, {} as Record<string, string>);
};

export const resolveSocketToken = (socket: Socket): string | undefined => {
  let token = socket.handshake.auth?.token;

  // The client cannot read the HttpOnly cookie, so it may pass a non-JWT value
  // (or nothing). Fall back to the HttpOnly access-token cookie when present.
  if ((!token || token.split('.').length !== 3) && socket.request.headers.cookie) {
    token = parseCookies(socket.request.headers.cookie).tamad_access_token || token;
  }

  return token as string | undefined;
};

export const authenticateSocket = (socket: Socket): any => {
  const token = resolveSocketToken(socket);
  if (!token) {
    throw new Error('Authentication error');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  (socket as any).user = decoded;
  return decoded;
};

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    authenticateSocket(socket);
    next();
  } catch {
    next(new Error('Authentication error'));
  }
};
