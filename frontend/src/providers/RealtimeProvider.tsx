import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useNotifStore } from '../store/notifStore';

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

  const workspaceId = workspace?._id;

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
  }, []);

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
      fetchNotifications();
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('task_created', () => fetchTasks(workspaceId));
    newSocket.on('task_updated', () => fetchTasks(workspaceId));
    newSocket.on('task_deleted', () => fetchTasks(workspaceId));
    newSocket.on('tasks_bulk_updated', () => fetchTasks(workspaceId));
    newSocket.on('tasks_bulk_deleted', () => fetchTasks(workspaceId));

    newSocket.on('notification_created', () => fetchNotifications());

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

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, workspaceId, fetchTasks, addRealtime, fetchNotifications]);

  return (
    <RealtimeContext.Provider value={{ socket, isConnected, onlineUsers, requestNotificationPermission }}>
      {children}
    </RealtimeContext.Provider>
  );
};
