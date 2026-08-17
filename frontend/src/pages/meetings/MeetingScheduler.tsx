import React, { useState } from 'react';
import { useMeetingStore } from '../../store/meetingStore';

interface Props {
  onClose: () => void;
  teamId: string;
}

const MeetingScheduler: React.FC<Props> = ({ onClose, teamId }) => {
  const { createMeeting } = useMeetingStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: 'Sprint Planning',
    date: '',
    time: '',
    duration: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      await createMeeting({
        ...formData,
        teamId,
        startTime,
        workspaceId: '65f0a0000000000000000000' // Mock for now, should come from context
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-lg">
        <div className="modal-header">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Schedule Meeting</h2>
           <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--color-muted)' }} aria-label="Close dialog">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
           </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="E.g., Sprint 42 Planning"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Meeting Type</label>
              <select
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                className="input"
              >
                <option>Sprint Planning</option>
                <option>Daily Stand-up</option>
                <option>Sprint Retrospective</option>
                <option>Custom Meeting</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Date</label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Time</label>
                <input
                  required
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingScheduler;
