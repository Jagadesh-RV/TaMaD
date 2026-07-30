import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useTamadMeetStore } from '../../../store/tamadMeetStore';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { Video, Mic, VideoOff, MicOff, PhoneOff, MonitorUp } from 'lucide-react';

export default function TamadMeetRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { currentRoom, currentParticipant, joinRoom, leaveRoom } = useTamadMeetStore();
  const { localStream, remoteStreams, startLocalStream, stopLocalStream } = useWebRTC(roomId, currentParticipant?._id);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId).catch(() => navigate('/team/tamad-meet'));
    }
    return () => leaveRoom();
  }, [roomId]);

  useEffect(() => {
    if (currentRoom && currentParticipant) {
      startLocalStream();
    }
    return () => stopLocalStream();
  }, [currentRoom, currentParticipant]);

  if (!currentRoom) return <div className="p-8">Joining room...</div>;

  return (
    <div className="flex h-screen bg-black text-white flex-col">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="font-bold">TaMaD Meet: Room {roomId}</h1>
      </header>
      
      <main className="flex-1 overflow-auto p-4 flex gap-4 flex-wrap justify-center items-center">
        {/* Local Video */}
        {localStream && (
          <div className="relative w-[320px] h-[240px] bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
            <video 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
              ref={el => { if (el) el.srcObject = localStream }} 
            />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">{user?.name} (You)</div>
          </div>
        )}

        {/* Remote Videos */}
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <div key={id} className="relative w-[320px] h-[240px] bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
            <video 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
              ref={el => { if (el) el.srcObject = stream }} 
            />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">Participant</div>
          </div>
        ))}
      </main>

      <footer className="p-4 border-t border-gray-800 flex justify-center gap-4">
        <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"><Mic size={20} /></button>
        <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"><Video size={20} /></button>
        <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"><MonitorUp size={20} /></button>
        <button onClick={() => navigate('/team/tamad-meet')} className="p-3 rounded-full bg-red-600 hover:bg-red-700"><PhoneOff size={20} /></button>
      </footer>
    </div>
  );
}
