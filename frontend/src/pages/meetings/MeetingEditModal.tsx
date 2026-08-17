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
    <div className="modal-overlay">
      <div className="modal max-w-md">
        <div className="modal-header">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Edit Meeting</h2>
           <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--color-muted)' }} aria-label="Close dialog">
             <X size={20} />
           </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Meeting Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Start Time</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="input"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingEditModal;
