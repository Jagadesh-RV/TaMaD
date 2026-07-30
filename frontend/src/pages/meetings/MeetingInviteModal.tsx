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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite to {meeting.title}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Share Link</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400"
            />
            <button
              onClick={copyLink}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Invite Team Members</label>
          {loading ? (
            <p className="text-sm text-gray-500">Loading members...</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.user._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {member.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInvite(member.user._id)}
                    className="text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    Invite
                  </button>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-gray-500">No other team members found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingInviteModal;
