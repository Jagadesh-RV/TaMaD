import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useMeetingStore } from '../../store/meetingStore';
import { useParams, useNavigate } from 'react-router-dom';
import MeetingNotes from './MeetingNotes';

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { activeToken, currentMeeting, endMeeting, clearActiveMeeting, joinMeeting } = useMeetingStore();
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(false);

  // If page is refreshed and token is lost but we have meetingId
  useEffect(() => {
    if (!activeToken && meetingId) {
      joinMeeting(meetingId).catch(() => navigate(-1));
    }
  }, [activeToken, meetingId, joinMeeting, navigate]);

  const handleDisconnected = () => {
    clearActiveMeeting();
    navigate(-1);
  };

  const handleEndMeeting = async () => {
    if (meetingId) {
      await endMeeting(meetingId);
      navigate(-1);
    }
  };

  if (!activeToken || !currentMeeting) return <div className="p-8 text-center">Connecting to meeting room...</div>;

  const serverUrl = 'wss://tamad-hmidu7j9.livekit.cloud';

  return (
    <div className="h-screen w-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 z-10 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <h2 className="font-semibold">{currentMeeting.title}</h2>
          <span className="text-gray-400 text-sm bg-gray-800 px-2 py-0.5 rounded">{currentMeeting.meetingType}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${showNotes ? 'bg-primary-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
          <button 
            onClick={handleEndMeeting}
            className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            End Meeting
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LiveKit Video Area */}
        <div className={`flex-1 relative ${showNotes ? 'border-r border-gray-800' : ''}`}>
          <LiveKitRoom
            video={true}
            audio={true}
            token={activeToken}
            serverUrl={serverUrl}
            onDisconnected={handleDisconnected}
            data-lk-theme="default"
            className="h-full w-full custom-lk-room"
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>

        {/* Notes Sidebar */}
        {showNotes && (
          <div className="w-96 bg-white dark:bg-dark-bg flex flex-col h-full shrink-0">
            <MeetingNotes meetingId={currentMeeting._id} />
          </div>
        )}
      </div>
      
      {/* Custom CSS overrides for LiveKit UI if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-lk-room { height: 100%; display: flex; flex-direction: column; }
        .lk-video-conference { flex: 1; }
      `}} />
    </div>
  );
};

export default MeetingRoom;
