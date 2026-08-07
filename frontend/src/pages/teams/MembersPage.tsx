import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTeamStore } from '../../store/teamStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { UserPlus, UserMinus, Users, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, var(--color-accent), var(--color-info))',
  'linear-gradient(135deg, var(--color-success), #34d399)',
  'linear-gradient(135deg, var(--color-warning), var(--color-danger))',
  'linear-gradient(135deg, #a78bfa, var(--color-info))',
];

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export default function MembersPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { currentTeam, members, getMembers, updateMemberRole, removeMember, inviteMember } = useTeamStore();

  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (currentWorkspace?.teamId) {
      getMembers(currentWorkspace.teamId);
    }
  }, [currentWorkspace?.teamId, getMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace?.teamId) return;

    setLoading(true);
    try {
      await inviteMember(currentWorkspace.teamId, inviteEmail, 'default-role-id', 'email');
      setInviteEmail('');
      toast.success('Invite sent');
    } catch {
      // error handled in store
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspace?.teamId) {
    return <div className="p-8 text-center text-sm font-medium text-[color:var(--color-muted)]">This workspace does not belong to a team.</div>;
  }

  return (
    <div className="page px-8 py-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--color-muted)' }}>
            <ShieldCheck size={14} />
            {currentTeam?.name || 'Team'}
          </p>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle mt-1">
            Manage who&apos;s in your workspace and what they can do.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 shadow-xs">
          <Users size={15} className="text-[color:var(--color-accent)]" />
          <span className="text-sm font-bold text-[color:var(--color-foreground)]">{members.length}</span>
          <span className="text-xs font-medium text-[color:var(--color-muted)]">members</span>
        </div>
      </div>

      {/* Invite box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="mb-8 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-xs"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]">
            <UserPlus size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[color:var(--color-foreground)]">Invite new member</h3>
            <p className="text-xs font-medium text-[color:var(--color-muted)]">They&apos;ll get an email to join your team.</p>
          </div>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            className="h-11 flex-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 text-sm font-medium text-[color:var(--color-foreground)] outline-none transition-all placeholder:text-[color:var(--color-muted)] hover:border-[color:var(--color-border)] focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[color:var(--color-accent-ghost)]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            <UserPlus size={16} />
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </motion.div>

      {/* Members table */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-hover)]">
            <tr>
              <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">Member</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">Status</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">Joined</th>
              <th className="p-4 text-right text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {members.map((member, i) => (
                <motion.tr
                  key={member._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className="group border-b border-[color:var(--color-border-light)] last:border-0 transition-colors hover:bg-[color:var(--color-surface-hover)]"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-sm"
                        style={{ background: gradientFor(member.userId.name) }}
                      >
                        {member.userId.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[color:var(--color-foreground)]">{member.userId.name}</p>
                        <p className="text-xs font-medium text-[color:var(--color-muted)]">{member.userId.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                        member.status === 'active'
                          ? 'bg-[color:var(--color-success-light)] text-[color:var(--color-success)]'
                          : 'bg-[color:var(--color-warning-light)] text-[color:var(--color-warning)]',
                      )}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        {member.status === 'active' && (
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 rounded-full bg-current"
                          />
                        )}
                        <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                      {member.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-[13px] font-medium text-[color:var(--color-muted)]">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="rounded-full bg-[color:var(--color-surface-active)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-muted)]">
                        {member.roleId?.name || 'Member'}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this member?')) {
                            removeMember(currentWorkspace.teamId!, member.userId._id);
                          }
                        }}
                        title="Remove member"
                        className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-danger-light)] hover:text-[color:var(--color-danger)]"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-sm font-medium text-[color:var(--color-muted)]">
                  No members yet. Invite the first person above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
