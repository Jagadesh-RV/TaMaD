import { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { X, Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateTeamModalProps {
  onClose: () => void;
}

export default function CreateTeamModal({ onClose }: CreateTeamModalProps) {
  const { createTeam } = useTeamStore();
  const { fetchWorkspaces } = useWorkspaceStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    workspaceName: '',
    visibility: 'private' as 'private' | 'public',
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(s => ({
      ...s,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return toast.error('Name and slug are required');

    setLoading(true);
    try {
      await createTeam(formData);
      await fetchWorkspaces();
      onClose();
    } catch (error) {
      // toast is handled in store
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
            <Building2 size={20} className="text-[var(--color-accent)]" />
            <h2>Create New Team</h2>
          </div>
          <button onClick={onClose} className="rounded hover:bg-black/10 p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Team Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Product Team"
              className="w-full rounded-md border p-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Team Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-muted)]">tamad.com/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                className="flex-1 rounded-md border p-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Default Workspace Name</label>
            <input
              type="text"
              value={formData.workspaceName}
              onChange={(e) => setFormData(s => ({ ...s, workspaceName: e.target.value }))}
              placeholder={`e.g. ${formData.name || 'Team'} Workspace`}
              className="w-full rounded-md border p-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData(s => ({ ...s, visibility: e.target.value as any }))}
              className="w-full rounded-md border p-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            >
              <option value="private">Private (Invite only)</option>
              <option value="public">Public (Anyone with link can join)</option>
            </select>
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
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
