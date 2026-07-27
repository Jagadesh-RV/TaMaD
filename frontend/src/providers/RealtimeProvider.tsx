import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const user = useAuthStore(s => s.user);
  const workspace = useAuthStore(s => s.workspace);
  const fetchTasks = useTaskStore(s => s.fetchTasks);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const workspaceId = workspace?._id;

  useEffect(() => {
    if (!user || !workspaceId) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_workspace', workspaceId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('task_created', () => fetchTasks(workspaceId));
    newSocket.on('task_updated', () => fetchTasks(workspaceId));
    newSocket.on('task_deleted', () => fetchTasks(workspaceId));
    newSocket.on('tasks_bulk_updated', () => fetchTasks(workspaceId));
    newSocket.on('tasks_bulk_deleted', () => fetchTasks(workspaceId));

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, workspaceId, fetchTasks]);

  return (
    <RealtimeContext.Provider value={{ socket, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};
