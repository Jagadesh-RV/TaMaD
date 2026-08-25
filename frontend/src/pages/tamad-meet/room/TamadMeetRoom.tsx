import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useTamadMeetStore } from '../../../store/tamadMeetStore';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function TamadMeetRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { currentRoom, token, joinRoom, leaveRoom } = useTamadMeetStore();

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId).catch(() => navigate('/team/tamad-meet'));
    }
    return () => leaveRoom();
  }, [roomId, joinRoom, leaveRoom, navigate]);

  if (!currentRoom || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-[color:var(--color-background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton h-16 w-16 rounded-full" />
          <p className="text-[color:var(--color-foreground)] font-bold">Joining room...</p>
        </div>
      </div>
    );
  }

  // Normally, LIVEKIT_URL should be an environment variable.
  // We mock a placeholder server URL if one isn't defined.
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://tamad-meet-placeholder.livekit.cloud';

  return (
    <div className="flex h-screen flex-col bg-[color:var(--color-background)] text-[color:var(--color-foreground)]" data-theme="dark">
      <header className="p-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)] font-bold text-lg">
            TM
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">TaMaD Meet: Room {roomId}</h1>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">{user?.name} (You)</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden bg-[color:var(--color-background)]">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          data-lk-theme="default"
          className="h-full w-full"
          onDisconnected={() => navigate('/team/tamad-meet')}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </main>
    </div>
  );
}
