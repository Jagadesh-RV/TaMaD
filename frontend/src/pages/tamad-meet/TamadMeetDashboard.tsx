import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useTamadMeetStore } from '../../store/tamadMeetStore';
import { Video, Plus, Calendar, Settings, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import MeetingModal from './MeetingModal';

export default function TamadMeetDashboard() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { meetings, loading, fetchMeetings, createMeeting, joinRoom } = useTamadMeetStore();
  const navigate = useNavigate();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Instant' | 'Scheduled'>('Instant');

  useEffect(() => {
    if (currentWorkspace?.teamId) {
      fetchMeetings(currentWorkspace.teamId);
    }
  }, [currentWorkspace]);

  const handleOpenModal = (type: 'Instant' | 'Scheduled') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleMeetingSubmit = async (payload: any) => {
    if (!currentWorkspace?.teamId) return;
    setIsCreating(true);
    try {
      const meeting = await createMeeting({
        ...payload,
        teamId: currentWorkspace.teamId,
        workspaceId: currentWorkspace._id,
      });
      
      toast.success(payload.meetingType === 'Instant' ? 'Meeting started!' : 'Meeting scheduled!');
      setIsModalOpen(false);
      fetchMeetings(currentWorkspace.teamId);
      
      if (payload.meetingType === 'Instant') {
        navigate(`/team/tamad-meet/room/${meeting._id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="page flex h-full flex-col p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>TaMaD Meet Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>Enterprise WebRTC Communications</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal('Instant')} disabled={isCreating} className="btn btn-primary flex items-center gap-2">
            <Video size={16} /> Instant Meet
          </button>
          <button onClick={() => handleOpenModal('Scheduled')} className="btn btn-secondary flex items-center gap-2">
            <Plus size={16} /> Schedule
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((m: any) => (
              <div key={m._id} className="card p-4 rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold text-lg">{m.title}</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>{new Date(m.startTime).toLocaleString()}</p>
                <div className="mt-4 flex justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{m.status}</span>
                  <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => navigate(`/team/tamad-meet/room/${m._id}`)}>
                    <Play size={14} /> Join Room
                  </button>
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <p style={{ color: 'var(--color-muted)' }}>No meetings scheduled.</p>
            )}
          </div>
        )}
      </div>
      
      <MeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        onSubmit={handleMeetingSubmit}
        isCreating={isCreating}
        teamId={currentWorkspace?.teamId || ''}
      />
    </div>
  );
}
