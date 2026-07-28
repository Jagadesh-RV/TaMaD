import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useNotifStore } from '../store/notifStore';
import api from '../utils/api';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const RealtimeContext = createContext<RealtimeContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  requestNotificationPermission: async () => 'default',
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore(s => s.user);
  const workspace = useAuthStore(s => s.workspace);
  const fetchTasks = useTaskStore(s => s.fetchTasks);
  const addRealtime = useNotifStore(s => s.addRealtime);
  const fetchNotifications = useNotifStore(s => s.fetchNotifications);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const workspaceId = workspace?._id;

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
  }, []);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data } = await api.get('/auth/me');
      return data.user?.id || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user || !workspaceId) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const connectSocket = async () => {
      const token = await getAuthToken();
      
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        newSocket.emit('join_workspace', workspaceId);
        fetchNotifications();
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', async (error) => {
        console.error('Socket connection error:', error.message);
        reconnectAttempts.current++;
        
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          const newToken = await getAuthToken();
          if (newToken) {
            newSocket.auth = { token: newToken };
            newSocket.connect();
            reconnectAttempts.current = 0;
          }
        }
      });

      newSocket.on('reconnect', () => {
        setIsConnected(true);
        newSocket.emit('join_workspace', workspaceId);
        fetchNotifications();
      });

      newSocket.on('task_created', () => fetchTasks(workspaceId));
      newSocket.on('task_updated', () => fetchTasks(workspaceId));
      newSocket.on('task_deleted', () => fetchTasks(workspaceId));
      newSocket.on('tasks_bulk_updated', () => fetchTasks(workspaceId));
      newSocket.on('tasks_bulk_deleted', () => fetchTasks(workspaceId));

      newSocket.on('notification_created', (data: any) => {
        addRealtime(data);
      });

      newSocket.on('notification_updated', (data: any) => {
        fetchNotifications();
      });

      newSocket.on('notification_deleted', () => {
        fetchNotifications();
      });

      newSocket.on('notification_read_all', () => {
        fetchNotifications();
      });

      newSocket.on('presence_update', (data: { workspaceId: string; users: string[] }) => {
        if (data.workspaceId === workspaceId) {
          setOnlineUsers(data.users);
        }
      });

      newSocket.on('task_assigned', (data: { taskId: string; taskTitle: string; assignedBy: string }) => {
        addRealtime({
          title: 'Task Assigned',
          body: `You have been assigned to "${data.taskTitle}"`,
          type: 'task_assigned',
          entityId: data.taskId,
          entityType: 'task',
        });
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user, workspaceId, fetchTasks, addRealtime, fetchNotifications, getAuthToken]);

  return (
    <RealtimeContext.Provider value={{ socket, isConnected, onlineUsers, requestNotificationPermission }}>
      {children}
    </RealtimeContext.Provider>
  );
};
