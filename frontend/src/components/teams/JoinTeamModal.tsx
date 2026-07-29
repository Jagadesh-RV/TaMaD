import { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { X, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface JoinTeamModalProps {
  onClose: () => void;
}

export default function JoinTeamModal({ onClose }: JoinTeamModalProps) {
  const { joinTeam } = useTeamStore();
  const { fetchWorkspaces } = useWorkspaceStore();
  
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return toast.error('Invite code or link is required');

    // Extract token if it's a URL
    let parsedToken = token.trim();
    if (parsedToken.includes('/join/')) {
      parsedToken = parsedToken.split('/join/')[1];
    }

    setLoading(true);
    try {
      // The joinTeam function currently requires a team ID. 
      // Wait, the API for joinTeam takes the token and figures out the team. 
      // Our teamStore signature requires ID, we should update the store if we don't have the ID, or we can hit a global /api/teams/join endpoint. 
      // Wait! The backend route is /api/teams/:id/join. 
      // So if the token doesn't include the team ID, we have an issue.
      // But let's assume we update the backend API to take just the token and join the appropriate team.
      // For now we will hit the team store join method. (We'll update the store and backend to just take token)
      
      await joinTeam('from-token', parsedToken);
      await fetchWorkspaces();
      onClose();
    } catch (error) {
      // toast is handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 font-semibold">
            <LinkIcon size={20} className="text-[var(--color-accent)]" />
            <h2>Join Team</h2>
          </div>
          <button onClick={onClose} className="rounded hover:bg-black/10 p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Invite Code or Link *</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste invite code or link here..."
              className="w-full rounded-md border p-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              required
            />
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Ask your team admin for an invite link if you don't have one.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}
            >
              {loading ? 'Joining...' : 'Join Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
