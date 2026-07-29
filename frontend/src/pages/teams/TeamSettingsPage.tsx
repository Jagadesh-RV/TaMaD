import { useState, useEffect } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Save, AlertTriangle, Trash2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamSettingsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { teams, updateTeam, deleteTeam, leaveTeam } = useTeamStore();

  const currentTeam = teams.find(t => t._id === currentWorkspace?.teamId);

  const [formData, setFormData] = useState<{name: string; description: string; visibility: 'private' | 'public'}>({
    name: '',
    description: '',
    visibility: 'private',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentTeam) {
      setFormData({
        name: currentTeam.name || '',
        description: currentTeam.description || '',
        visibility: currentTeam.visibility || 'private',
      });
    }
  }, [currentTeam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    setLoading(true);
    try {
      await updateTeam(currentTeam._id, formData);
    } finally {
      setLoading(false);
    }
  };

  if (!currentTeam) {
    return <div className="p-8 text-center text-[var(--color-muted)]">This workspace does not belong to a team.</div>;
  }

  return (
    <div className="flex h-full flex-col p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Team Settings</h1>
        <p className="text-sm text-[var(--color-muted)]">Manage team profile, preferences, and danger zone.</p>
      </div>

      <div className="grid gap-8 max-w-3xl">
        {/* Profile Settings */}
        <section className="rounded-xl border p-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <h2 className="mb-4 text-lg font-semibold">General</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Team Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(s => ({ ...s, name: e.target.value }))}
                className="w-full rounded-md border p-2.5 text-sm focus:border-[var(--color-accent)] outline-none"
                style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                required
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))}
                className="w-full rounded-md border p-2.5 text-sm focus:border-[var(--color-accent)] outline-none min-h-[100px]"
                style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-[var(--color-danger)]/20 p-6" style={{ background: 'var(--color-danger-light)' }}>
          <div className="mb-4 flex items-center gap-2 text-[var(--color-danger)]">
            <AlertTriangle size={20} />
            <h2 className="text-lg font-semibold">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-[var(--color-surface)] border-[var(--color-border)]">
              <div>
                <h4 className="font-semibold text-sm">Leave Team</h4>
                <p className="text-xs text-[var(--color-muted)]">Revoke your access to this team.</p>
              </div>
              <button 
                onClick={() => {
                  if(confirm('Are you sure you want to leave this team?')) {
                    leaveTeam(currentTeam._id);
                  }
                }}
                className="rounded-md px-4 py-2 text-sm font-medium border text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-colors"
              >
                Leave Team
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-[var(--color-surface)] border-[var(--color-border)]">
              <div>
                <h4 className="font-semibold text-sm text-[var(--color-danger)]">Delete Team</h4>
                <p className="text-xs text-[var(--color-muted)]">Permanently delete this team and all its data.</p>
              </div>
              <button 
                onClick={() => {
                  if(confirm('Are you absolutely sure? This action cannot be undone.')) {
                    deleteTeam(currentTeam._id);
                  }
                }}
                className="rounded-md px-4 py-2 text-sm font-medium bg-[var(--color-danger)] text-white hover:bg-red-700 transition-colors"
              >
                Delete Team
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
