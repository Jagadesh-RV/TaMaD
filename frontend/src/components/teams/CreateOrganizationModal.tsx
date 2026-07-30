import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useOrganizationStore } from '../../store/organizationStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { X, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateOrganizationModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const { createOrganization } = useOrganizationStore();
  const { fetchWorkspaces } = useWorkspaceStore(); // re-fetch after org created
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createOrganization({ name, domain });
      toast.success('Organization created successfully');
      await fetchWorkspaces();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div 
        className="w-full max-w-md rounded-xl border p-6 shadow-xl"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building size={20} className="text-purple-500" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
              Create Organization
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-[color:var(--color-surface-hover)]"
            style={{ color: 'var(--color-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              Organization Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-lg border p-2.5 text-sm outline-none transition-colors"
              style={{ 
                background: 'var(--color-background)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)'
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              Domain (Optional)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="acme.com"
              className="w-full rounded-lg border p-2.5 text-sm outline-none transition-colors"
              style={{ 
                background: 'var(--color-background)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)'
              }}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
