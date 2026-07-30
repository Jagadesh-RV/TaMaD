import React, { useState } from 'react';
import { useMeetingStore, Meeting } from '../../store/meetingStore';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  meeting: Meeting;
  onClose: () => void;
}

const MeetingEditModal: React.FC<Props> = ({ meeting, onClose }) => {
  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description || '');
  const [startTime, setStartTime] = useState(format(new Date(meeting.startTime), "yyyy-MM-dd'T'HH:mm"));
  
  const { updateMeeting } = useMeetingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMeeting(meeting._id, {
        title,
        description,
        startTime: new Date(startTime).toISOString()
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Meeting</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-transparent border-gray-300 dark:border-gray-700 h-24 resize-none text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Time</label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingEditModal;
