import React, { useEffect, useState } from 'react';
import { useMeetingStore } from '../../store/meetingStore';
import { useTeamStore } from '../../store/teamStore';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Copy, XCircle, Trash2, UserPlus, Video } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import MeetingScheduler from './MeetingScheduler';
import MeetingEditModal from './MeetingEditModal';
import MeetingInviteModal from './MeetingInviteModal';

const MeetingsDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { meetings, fetchMeetings, joinMeeting, loading } = useMeetingStore();
  const { currentTeam } = useTeamStore();
  const navigate = useNavigate();
  const [showScheduler, setShowScheduler] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [invitingToMeeting, setInvitingToMeeting] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { deleteMeeting, cancelMeeting, duplicateMeeting } = useMeetingStore();

  useEffect(() => {
    if (teamId) {
      fetchMeetings(teamId);
    }
  }, [teamId, fetchMeetings]);

  const handleJoin = async (id: string) => {
    try {
      await joinMeeting(id);
      navigate(`/team/${teamId}/meetings/${id}/room`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      await deleteMeeting(id);
    }
  };

  if (loading) return <div className="p-6" style={{ color: 'var(--color-muted)' }}>Loading meetings...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto page">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">
            Manage team meetings, recordings, and insights for {currentTeam?.name}
          </p>
        </div>
        <button
          onClick={() => setShowScheduler(true)}
          className="btn btn-primary"
        >
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting._id} className="card p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--color-foreground)' }}>{meeting.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  meeting.status === 'active' ? 'badge-success' :
                  meeting.status === 'ended' ? 'badge-neutral' :
                  meeting.status === 'cancelled' ? 'badge-danger' :
                  'badge-info'
                }`}>
                  {meeting.status}
                </span>
              </div>
            </div>
            
            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-muted)' }}>
              {meeting.description || 'No description provided'}
            </p>

            <div className="flex items-center text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {format(new Date(meeting.startTime), 'MMM d, yyyy h:mm a')}
            </div>

            <div className="mt-auto">
              <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                <button onClick={() => setEditingMeeting(meeting)} className="btn btn-secondary flex-1 px-2 py-1.5 text-xs">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setInvitingToMeeting(meeting)} className="btn btn-secondary flex-1 px-2 py-1.5 text-xs">
                  <UserPlus size={12} /> Invite
                </button>
                <button onClick={() => duplicateMeeting(meeting._id)} className="btn btn-secondary flex-1 px-2 py-1.5 text-xs">
                  <Copy size={12} /> Copy
                </button>
                {meeting.status !== 'cancelled' && meeting.status !== 'ended' && (
                  <button onClick={() => cancelMeeting(meeting._id)} className="btn flex-1 px-2 py-1.5 text-xs" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                    <XCircle size={12} /> Cancel
                  </button>
                )}
                <button onClick={() => handleDelete(meeting._id)} className="btn flex-1 px-2 py-1.5 text-xs" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>

              {meeting.status !== 'ended' && meeting.status !== 'cancelled' && (
                <button
                  onClick={() => handleJoin(meeting._id)}
                  className="btn w-full justify-center"
                  style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                >
                  Join Meeting
                </button>
              )}
              
              {meeting.status === 'ended' && meeting.aiSummary && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>AI Summary</h4>
                  <p className="text-sm line-clamp-3" style={{ color: 'var(--color-foreground)' }}>{meeting.aiSummary}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {meetings.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={Video}
              title="No meetings found"
              description="Face-to-face beats back-and-forth. Schedule the first team meeting and turn chatter into action with live notes."
              steps={[
                'Click Schedule to pick a time and invite your team',
                'Join with one click when the room is open',
                'Walk away with live notes and an AI summary',
              ]}
              action={{ label: 'Schedule Meeting', onClick: () => setShowScheduler(true) }}
            />
          </div>
        )}
      </div>

      {showScheduler && (
        <MeetingScheduler onClose={() => setShowScheduler(false)} teamId={teamId!} />
      )}
      {editingMeeting && (
        <MeetingEditModal meeting={editingMeeting} onClose={() => setEditingMeeting(null)} />
      )}
      {invitingToMeeting && (
        <MeetingInviteModal meeting={invitingToMeeting} onClose={() => setInvitingToMeeting(null)} />
      )}
    </div>
  );
};

export default MeetingsDashboard;
