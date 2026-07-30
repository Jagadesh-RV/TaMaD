import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

import { useAuthStore } from '../../store/authStore';
import { Send, Users, FileText, MessageSquare } from 'lucide-react';

interface Props {
  meetingId: string;
}

const MeetingNotes: React.FC<Props> = ({ meetingId }) => {
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'presence'>('notes');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [presence, setPresence] = useState<string[]>([]);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    
    setSocket(newSocket);
    
    newSocket.emit('meeting_join', { meetingId, userId: user?.id });
    
    newSocket.on('meeting_notes_updated', (data: { content: string }) => {
      setContent(data.content);
    });

    newSocket.on('meeting_chat_received', (chat: any) => {
      setChatMessages(prev => [...prev, chat]);
    });

    newSocket.on('meeting_presence_update', (userIds: string[]) => {
      setPresence(userIds);
    });

    return () => {
      newSocket.emit('meeting_leave', { meetingId, userId: user?.id });
      newSocket.disconnect();
    };
  }, [meetingId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket) {
      socket.emit('meeting_notes_update', { meetingId, content: newContent });
    }
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    
    socket.emit('meeting_chat', { meetingId, senderId: user?.id, message: newMessage });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg">
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'notes' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText size={16} /> Notes
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <MessageSquare size={16} /> Chat
        </button>
        <button
          onClick={() => setActiveTab('presence')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'presence' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Users size={16} /> Users ({presence.length})
        </button>
      </div>

      {activeTab === 'notes' && (
        <div className="flex-1 p-0 flex flex-col">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Type meeting notes here... (Markdown supported)"
            className="w-full h-full p-4 resize-none bg-transparent text-gray-800 dark:text-gray-200 border-none focus:ring-0 outline-none placeholder-gray-400"
          />
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${msg.senderId === user?.id ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">No messages yet. Start chatting!</div>
            )}
          </div>
          <form onSubmit={sendChatMessage} className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button type="submit" className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {activeTab === 'presence' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {presence.map(userId => (
            <div key={userId} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs relative">
                {userId.charAt(0).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">User {userId.substring(0, 4)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingNotes;
