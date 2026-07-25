import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({ socket: null, isConnected: false });

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const { fetchTasks } = useTaskStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Use environment variable or fallback to same origin if not set
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Automatically join a default workspace for now
      newSocket.emit('join_workspace', '000000000000000000000000');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time Event Listeners
    newSocket.on('task_created', (task) => {
      fetchTasks('000000000000000000000000');
    });

    newSocket.on('task_updated', (task) => {
      fetchTasks('000000000000000000000000');
    });

    newSocket.on('task_deleted', ({ taskId }) => {
      fetchTasks('000000000000000000000000');
    });

    newSocket.on('tasks_bulk_updated', () => {
      fetchTasks('000000000000000000000000');
    });

    newSocket.on('tasks_bulk_deleted', () => {
      fetchTasks('000000000000000000000000');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, fetchTasks]);

  return (
    <RealtimeContext.Provider value={{ socket, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};
