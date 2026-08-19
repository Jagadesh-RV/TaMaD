import React, { useEffect, useState } from 'react';
import { useMeetingStore } from '../../store/meetingStore';
import { useTeamStore } from '../../store/teamStore';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Edit2, Copy, XCircle, Trash2, UserPlus, Video, Calendar,
  Users, Clock, AlertTriangle, Plus, CheckCircle,
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import MeetingScheduler from './MeetingScheduler';
import MeetingEditModal from './MeetingEditModal';
import MeetingInviteModal from './MeetingInviteModal';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Internal confirm dialog — replaces browser confirm()
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="modal modal-sm"
          >
            <div className="modal-header">
              <div className="flex items-center gap-2.5">
                {danger && (
                  <span className="flex items-center justify-center rounded-lg"
                    style={{ width: 32, height: 32, background: 'var(--color-danger-ghost)', color: 'var(--color-danger)' }}>
                    <AlertTriangle size={15} />
                  </span>
                )}
                <h2 className="modal-title" id="confirm-title">{title}</h2>
              </div>
            </div>
            <div className="modal-body">
              <p className="text-[13px]" style={{ color: 'var(--color-foreground-secondary)' }}>{message}</p>
            </div>
            <div className="modal-footer">
              <button onClick={onCancel} className="btn btn-md btn-secondary">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={clsx('btn btn-md', danger ? 'btn-danger' : 'btn-primary')}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const STATUS_CONFIG = {
  active: { label: 'Live', className: 'badge-success' },
  scheduled: { label: 'Scheduled', className: 'badge-info' },
  ended: { label: 'Ended', className: 'badge-neutral' },
  cancelled: { label: 'Cancelled', className: 'badge-danger' },
} as const;

type MeetingTab = 'upcoming' | 'live' | 'past';

const MeetingsDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { meetings, fetchMeetings, joinMeeting, loading } = useMeetingStore();
  const { currentTeam } = useTeamStore();
  const navigate = useNavigate();
  const [showScheduler, setShowScheduler] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [invitingToMeeting, setInvitingToMeeting] = useState<any>(null);
  const { deleteMeeting, cancelMeeting, duplicateMeeting } = useMeetingStore();
  const [tab, setTab] = useState<MeetingTab>('upcoming');

  // Confirmation dialog state
  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({ isOpen: false, title: '', message: '', confirmLabel: 'Confirm', onConfirm: () => {} });

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

  const handleDelete = (id: string) => {
    setConfirm({
      isOpen: true,
      title: 'Delete meeting',
      message: 'This meeting will be permanently deleted. This action cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        await deleteMeeting(id);
        setConfirm(c => ({ ...c, isOpen: false }));
      },
    });
  };

  const handleCancel = (id: string) => {
    setConfirm({
      isOpen: true,
      title: 'Cancel meeting',
      message: 'This meeting will be cancelled. Participants will be notified.',
      confirmLabel: 'Cancel Meeting',
      danger: false,
      onConfirm: async () => {
        await cancelMeeting(id);
        setConfirm(c => ({ ...c, isOpen: false }));
      },
    });
  };

  // Tab filter
  const liveMeetings = meetings.filter(m => m.status === 'active');
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');
  const pastMeetings = meetings.filter(m => m.status === 'ended' || m.status === 'cancelled');

  const tabMeetings: Record<MeetingTab, typeof meetings> = {
    live: liveMeetings,
    upcoming: upcomingMeetings,
    past: pastMeetings,
  };

  const displayedMeetings = tabMeetings[tab];

  return (
    <div className="page pb-20">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">
            {currentTeam?.name ? `${currentTeam.name} · ` : ''}{meetings.length} total
          </p>
        </div>
        <button
          onClick={() => setShowScheduler(true)}
          className="btn btn-md btn-primary"
        >
          <Plus size={15} />
          Schedule
        </button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar mb-6">
        {([
          { key: 'live',     label: 'Live Now', count: liveMeetings.length },
          { key: 'upcoming', label: 'Upcoming', count: upcomingMeetings.length },
          { key: 'past',     label: 'Past',     count: pastMeetings.length },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx('tab-item', tab === t.key && 'active')}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className="ml-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  minWidth: 18,
                  height: 16,
                  padding: '0 5px',
                  background: tab === t.key ? 'var(--color-accent-light)' : 'var(--color-surface-active)',
                  color: tab === t.key ? 'var(--color-accent)' : 'var(--color-foreground-tertiary)',
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : displayedMeetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title={`No ${tab === 'live' ? 'live' : tab === 'upcoming' ? 'upcoming' : 'past'} meetings`}
          description={
            tab === 'upcoming'
              ? 'Schedule a meeting to coordinate with your team'
              : tab === 'live'
              ? 'No meetings are currently active'
              : 'Completed meetings will appear here'
          }
          action={tab !== 'past' ? { label: 'Schedule Meeting', onClick: () => setShowScheduler(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedMeetings.map((meeting) => {
            const statusConf = STATUS_CONFIG[meeting.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.scheduled;
            const isLive = meeting.status === 'active';
            const canJoin = meeting.status !== 'ended' && meeting.status !== 'cancelled';

            return (
              <motion.div
                key={meeting._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card flex flex-col"
                style={{
                  borderLeft: isLive ? '3px solid var(--color-success)' : undefined,
                }}
              >
                <div className="card-body flex flex-col gap-3 flex-1">
                  {/* Status + Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[14px] font-semibold leading-snug"
                      style={{ color: 'var(--color-foreground)' }}>
                      {meeting.title}
                    </h3>
                    <span className={clsx('badge shrink-0', statusConf.className)}>
                      {isLive && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      )}
                      {statusConf.label}
                    </span>
                  </div>

                  {/* Description */}
                  {meeting.description && (
                    <p className="text-[12px] line-clamp-2" style={{ color: 'var(--color-foreground-secondary)' }}>
                      {meeting.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-foreground-tertiary)' }}>
                      <Calendar size={12} />
                      {format(new Date(meeting.startTime), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-foreground-tertiary)' }}>
                      <Clock size={12} />
                      {format(new Date(meeting.startTime), 'h:mm a')}
                    </div>
                    {meeting.participants?.length > 0 && (
                      <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-foreground-tertiary)' }}>
                        <Users size={12} />
                        {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* AI Summary for ended meetings */}
                  {meeting.status === 'ended' && meeting.aiSummary && (
                    <div className="rounded-lg p-3" style={{ background: 'var(--color-surface-active)', border: '1px solid var(--color-border-light)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--color-foreground-tertiary)' }}>AI Summary</p>
                      <p className="text-[12px] line-clamp-3" style={{ color: 'var(--color-foreground)' }}>
                        {meeting.aiSummary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions footer */}
                <div className="card-footer gap-2 flex flex-col">
                  {/* Primary action */}
                  {canJoin && (
                    <button
                      onClick={() => handleJoin(meeting._id)}
                      className="btn btn-md btn-primary w-full"
                    >
                      <Video size={14} />
                      {isLive ? 'Join Now' : 'Join'}
                    </button>
                  )}

                  {/* Secondary actions */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setEditingMeeting(meeting)}
                      className="btn btn-xs btn-ghost flex-1"
                      title="Edit"
                    >
                      <Edit2 size={12} />Edit
                    </button>
                    <button
                      onClick={() => setInvitingToMeeting(meeting)}
                      className="btn btn-xs btn-ghost flex-1"
                      title="Invite"
                    >
                      <UserPlus size={12} />Invite
                    </button>
                    <button
                      onClick={() => duplicateMeeting(meeting._id)}
                      className="btn btn-xs btn-ghost flex-1"
                      title="Duplicate"
                    >
                      <Copy size={12} />Copy
                    </button>
                    {meeting.status !== 'cancelled' && meeting.status !== 'ended' && (
                      <button
                        onClick={() => handleCancel(meeting._id)}
                        className="btn btn-xs btn-ghost flex-1"
                        style={{ color: 'var(--color-warning)' }}
                        title="Cancel"
                      >
                        <XCircle size={12} />Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(meeting._id)}
                      className="btn btn-xs btn-ghost flex-1"
                      style={{ color: 'var(--color-danger)' }}
                      title="Delete"
                    >
                      <Trash2 size={12} />Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showScheduler && (
        <MeetingScheduler onClose={() => setShowScheduler(false)} teamId={teamId!} />
      )}
      {editingMeeting && (
        <MeetingEditModal meeting={editingMeeting} onClose={() => setEditingMeeting(null)} />
      )}
      {invitingToMeeting && (
        <MeetingInviteModal meeting={invitingToMeeting} onClose={() => setInvitingToMeeting(null)} />
      )}

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(c => ({ ...c, isOpen: false }))}
        danger={confirm.danger}
      />
    </div>
  );
};

export default MeetingsDashboard;
