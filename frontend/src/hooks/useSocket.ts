import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
  useEffect(() => {
    if (!token) return;

    const socket = io('/', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('notification', (payload) => {
      console.log('Notification', payload);
    });

    return () => socket.disconnect();
  }, [token]);
}