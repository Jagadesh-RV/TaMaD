import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../../store/workspaceStore';
import { ChevronDown, Check, Plus, Users } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Set default workspace if none selected
  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [currentWorkspace, workspaces, setCurrentWorkspace]);

  if (!currentWorkspace) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        style={{ background: 'var(--color-surface-hover)', color: 'var(--color-foreground)' }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: currentWorkspace.type === 'personal' ? 'var(--color-accent)' : 'var(--color-success)' }}
          />
          <span className="truncate">{currentWorkspace.name}</span>
        </div>
        <ChevronDown size={14} className="shrink-0 text-[var(--color-muted)]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: ws.type === 'personal' ? 'var(--color-accent)' : 'var(--color-success)' }}
                    />
                    <span className={clsx('truncate', currentWorkspace._id === ws._id && 'font-bold')}>
                      {ws.name}
                    </span>
                  </div>
                  {currentWorkspace._id === ws._id && <Check size={14} className="shrink-0 text-[var(--color-accent)]" />}
                </button>
              ))}
            </div>
            <div className="border-t border-[var(--color-border-light)] p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // In a real app this would open a modal to create a team
                  alert('Create team functionality coming soon');
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-hover)] text-[var(--color-muted)]"
              >
                <Plus size={14} />
                Create Team
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // navigate to invites or enter join code
                  alert('Join team functionality coming soon');
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-hover)] text-[var(--color-muted)]"
              >
                <Users size={14} />
                Join Team
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
