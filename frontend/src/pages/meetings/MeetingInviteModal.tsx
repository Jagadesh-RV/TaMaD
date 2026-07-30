import React, { useState, useEffect } from 'react';
import { useMeetingStore, Meeting } from '../../store/meetingStore';
import { useTeamStore } from '../../store/teamStore';
import { X, Copy, Check } from 'lucide-react';
import api from '../../utils/api';

interface Props {
  meeting: Meeting;
  onClose: () => void;
}

const MeetingInviteModal: React.FC<Props> = ({ meeting, onClose }) => {
  const { currentTeam } = useTeamStore();
  const { inviteMember } = useMeetingStore();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentTeam) return;
      try {
        const { data } = await api.get(`/teams/${currentTeam._id}/members`);
        setMembers(data.members || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [currentTeam]);

  const handleInvite = async (userId: string) => {
    try {
      await inviteMember(meeting._id, userId);
    } catch (e) {
      console.error(e);
    }
  };

  const inviteLink = `${window.location.origin}/team/${meeting.teamId}/meetings/${meeting._id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md flex flex-col max-h-[80vh]">
        <div className="modal-header">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Invite to {meeting.title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--color-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>Share Link</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              className="input flex-1"
            />
            <button
              onClick={copyLink}
              className="btn btn-secondary p-2"
            >
              {copied ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="modal-body flex-1 overflow-y-auto">
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-foreground)' }}>Invite Team Members</label>
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading members...</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.user._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar avatar-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                      {member.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{member.user.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{member.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInvite(member.user._id)}
                    className="btn btn-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                  >
                    Invite
                  </button>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No other team members found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingInviteModal;
