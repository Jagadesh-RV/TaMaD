import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

interface Props {
  meetingId: string;
}

const MeetingNotes: React.FC<Props> = ({ meetingId }) => {
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    
    setSocket(newSocket);
    
    newSocket.emit('meeting_join', meetingId);
    
    newSocket.on('meeting_notes_updated', (data: { content: string }) => {
      setContent(data.content);
    });

    return () => {
      newSocket.emit('meeting_leave', meetingId);
      newSocket.disconnect();
    };
  }, [meetingId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket) {
      socket.emit('meeting_notes_update', { meetingId, content: newContent });
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          Collaborative Notes
        </h3>
      </div>
      <div className="flex-1 p-0">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Type meeting notes here... (Markdown supported)"
          className="w-full h-full p-4 resize-none bg-white dark:bg-dark-bg text-gray-800 dark:text-gray-200 border-none focus:ring-0 outline-none placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default MeetingNotes;
