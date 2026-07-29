import { useEffect, useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { UserPlus, Shield, UserMinus, Mail, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { currentTeam, members, getMembers, updateMemberRole, removeMember, inviteMember } = useTeamStore();

  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Hardcoded for now. A real app would fetch available roles from the API.
  const ROLES = [
    { id: 'role-owner', name: 'Owner' },
    { id: 'role-admin', name: 'Admin' },
    { id: 'role-member', name: 'Member' },
    { id: 'role-viewer', name: 'Viewer' }
  ];

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
      // Assuming 'role-member' is a placeholder. Real implementation needs dynamic role ID.
      await inviteMember(currentWorkspace.teamId, inviteEmail, 'default-role-id', 'email');
      setInviteEmail('');
    } catch {
      // error handled in store
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspace?.teamId) {
    return <div className="p-8 text-center text-[var(--color-muted)]">This workspace does not belong to a team.</div>;
  }

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-[var(--color-muted)]">Manage your team members and their roles.</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <h3 className="mb-4 text-sm font-semibold">Invite new member</h3>
        <form onSubmit={handleInvite} className="flex gap-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 rounded-lg border p-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--color-accent)' }}
          >
            <UserPlus size={16} />
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      <div className="flex-1 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-[var(--color-surface-hover)]" style={{ borderColor: 'var(--color-border)' }}>
            <tr>
              <th className="p-4 font-medium">Member</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member._id} className="border-b last:border-0" style={{ borderColor: 'var(--color-border-light)' }}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
                      {member.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{member.userId.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{member.userId.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-success)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    {member.status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-4 text-[var(--color-muted)]">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-[var(--color-surface-hover)] text-[var(--color-muted)]">
                      {member.roleId?.name || 'Member'}
                    </span>
                    <button 
                      onClick={() => {
                        if(confirm('Are you sure you want to remove this member?')) {
                          removeMember(currentWorkspace.teamId!, member.userId._id);
                        }
                      }}
                      className="rounded p-1.5 hover:bg-[var(--color-danger-light)] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--color-muted)]">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
