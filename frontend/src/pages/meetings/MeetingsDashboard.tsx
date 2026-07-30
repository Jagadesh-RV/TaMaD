import React, { useEffect, useState } from 'react';
import { useMeetingStore } from '../../store/meetingStore';
import { useTeamStore } from '../../store/teamStore';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import MeetingScheduler from './MeetingScheduler';

const MeetingsDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { meetings, fetchMeetings, joinMeeting, loading } = useMeetingStore();
  const { currentTeam } = useTeamStore();
  const navigate = useNavigate();
  const [showScheduler, setShowScheduler] = useState(false);

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
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{meeting.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                meeting.status === 'active' ? 'bg-green-100 text-green-800' :
                meeting.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {meeting.status}
              </span>
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
    </div>
  );
};

export default MeetingsDashboard;
