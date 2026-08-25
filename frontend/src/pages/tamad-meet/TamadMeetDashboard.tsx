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

      setIsModalOpen(false);
      fetchMeetings(currentWorkspace.teamId);

      if (payload.meetingType === 'Instant') {
        celebrateMilestone('Meeting Started', 'You are joining an instant meeting!');
        navigate(`/team/tamad-meet/room/${meeting._id}`);
      } else {
        celebrateMilestone('Meeting Scheduled', 'Your meeting is scheduled successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="page flex h-full flex-col p-6">
      <header className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>TaMaD Meet Dashboard</h1>
          <p className="mt-1 truncate text-sm" style={{ color: 'var(--color-muted)' }}>Enterprise WebRTC Communications</p>
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <button onClick={() => handleOpenModal('Instant')} disabled={isCreating} className="btn btn-primary flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap sm:flex-none">
            <Video size={16} /> Instant Meet
          </button>
          <button onClick={() => handleOpenModal('Scheduled')} className="btn btn-secondary flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap sm:flex-none">
            <Plus size={16} /> Schedule
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((m: any) => (
              <div key={m._id} className="card p-5 rounded-xl border flex flex-col justify-between" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div>
                  <h3 className="font-bold text-[color:var(--color-foreground)] text-lg line-clamp-1">{m.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={14} className="text-[color:var(--color-muted)]" />
                    <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                      {new Date(m.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[color:var(--color-surface-active)] text-[color:var(--color-foreground-tertiary)]">
                    {m.status}
                  </span>
                  <button className="btn btn-primary btn-sm flex items-center gap-1.5" onClick={() => navigate(`/team/tamad-meet/room/${m._id}`)}>
                    <Play size={14} /> Join Room
                  </button>
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-[color:var(--color-border)] rounded-xl bg-[color:var(--color-surface)]">
                <Video size={32} className="text-[color:var(--color-muted)] mb-3 opacity-50" />
                <h3 className="text-sm font-bold text-[color:var(--color-foreground)]">No meetings scheduled</h3>
                <p className="text-xs text-[color:var(--color-muted)] mt-1 max-w-xs mx-auto">Click Instant Meet to start a call immediately, or Schedule to plan one for later.</p>
              </div>
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
