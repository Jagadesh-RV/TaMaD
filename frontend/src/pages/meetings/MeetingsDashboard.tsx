import React, { useEffect, useState } from 'react';
import { useMeetingStore } from '../../store/meetingStore';
import { useTeamStore } from '../../store/teamStore';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Copy, XCircle, Trash2, UserPlus } from 'lucide-react';
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

  if (loading) return <div className="p-6">Loading meetings...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage team meetings, recordings, and insights for {currentTeam?.name}
          </p>
        </div>
        <button
          onClick={() => setShowScheduler(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting._id} className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4 relative">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{meeting.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  meeting.status === 'active' ? 'bg-green-100 text-green-800' :
                  meeting.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                  meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {meeting.status}
                </span>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === meeting._id ? null : meeting._id)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <MoreVertical size={16} />
                </button>
                {activeDropdown === meeting._id && (
                  <div className="absolute top-8 right-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
                    <button onClick={() => { setEditingMeeting(meeting); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => { setInvitingToMeeting(meeting); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <UserPlus size={14} /> Invite Members
                    </button>
                    <button onClick={() => { duplicateMeeting(meeting._id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Copy size={14} /> Duplicate
                    </button>
                    {meeting.status !== 'cancelled' && (
                      <button onClick={() => { cancelMeeting(meeting._id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                    <button onClick={() => { handleDelete(meeting._id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {meeting.description || 'No description provided'}
            </p>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {format(new Date(meeting.startTime), 'MMM d, yyyy h:mm a')}
            </div>

            {meeting.status !== 'ended' && meeting.status !== 'cancelled' && (
              <button
                onClick={() => handleJoin(meeting._id)}
                className="w-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 py-2 rounded-lg font-medium transition-colors"
              >
                Join Meeting
              </button>
            )}
            
            {meeting.status === 'ended' && meeting.aiSummary && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI Summary</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{meeting.aiSummary}</p>
              </div>
            )}
          </div>
        ))}
        
        {meetings.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No meetings found. Schedule one to get started.</p>
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
