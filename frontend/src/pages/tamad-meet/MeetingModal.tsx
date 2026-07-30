import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Instant' | 'Scheduled';
  onSubmit: (payload: any) => void;
  isCreating: boolean;
  teamId: string;
}

export default function MeetingModal({ isOpen, onClose, type, onSubmit, isCreating, teamId }: MeetingModalProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const { members, getMembers } = useTeamStore();
  const currentUser = useAuthStore(s => s.user);

  useEffect(() => {
    if (isOpen && teamId) {
      getMembers(teamId);
    }
  }, [isOpen, teamId]);

  useEffect(() => {
    if (isOpen) {
      setTitle(type === 'Instant' ? 'Instant Meet' : 'Scheduled Meet');
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setStartTime(now.toISOString().slice(0, 16));
      setSelectedParticipants([]);
      setDuration(30);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      startTime: type === 'Instant' ? new Date().toISOString() : new Date(startTime).toISOString(),
      duration,
      meetingType: type,
      participants: selectedParticipants
    });
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Filter out current user from members to invite
  const inviteableMembers = members.filter(m => m.userId._id !== currentUser?._id);

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md w-full bg-surface text-foreground shadow-float" style={{ background: 'var(--color-surface)' }}>
        <div className="modal-header border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {type === 'Instant' ? 'Start Instant Meeting' : 'Schedule Meeting'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meeting Title</label>
              <input
                required
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter meeting title"
              />
            </div>

            {type === 'Scheduled' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    required
                    type="datetime-local"
                    className="input-field"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <input
                    required
                    type="number"
                    min="15"
                    step="15"
                    className="input-field"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Users size={16} /> Invite Team Members
              </label>
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                {inviteableMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No other team members found.</p>
                ) : (
                  inviteableMembers.map(member => (
                    <label key={member.userId._id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(member.userId._id)}
                        onChange={() => toggleParticipant(member.userId._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 w-4 h-4"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {member.userId.avatarUrl ? (
                          <img src={member.userId.avatarUrl} alt={member.userId.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                            {member.userId.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="text-sm font-medium truncate">{member.userId.name}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer border-t border-border p-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isCreating} className="btn btn-primary">
              {isCreating ? 'Processing...' : (type === 'Instant' ? 'Start Now' : 'Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
