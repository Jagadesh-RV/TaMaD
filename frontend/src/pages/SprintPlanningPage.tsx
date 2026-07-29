import { useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';

export default function SprintPlanningPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);

  useEffect(() => {
    // Connect to backend API to load backlog tasks, epics and planned sprints
  }, [currentWorkspace?._id]);

  if (!currentWorkspace) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] p-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Backlog & Planning</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Plan your sprints for {currentWorkspace.name}
          </p>
        </div>
        <button className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 text-white" style={{ background: 'var(--color-accent)' }}>
          Create Sprint
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sprint Planning Area */}
        <div className="flex-1 overflow-y-auto p-6" style={{ borderRight: '1px solid var(--color-border-light)' }}>
          <div className="mb-6 rounded-xl border border-[var(--color-border-light)] p-5" style={{ background: 'var(--color-surface)' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Sprint 1</h2>
              <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>0 pts</span>
            </div>
            <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Drag issues here to plan your sprint</p>
            </div>
          </div>
        </div>

        {/* Backlog Area */}
        <div className="w-96 overflow-y-auto p-6" style={{ background: 'var(--color-surface-hover)' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Backlog</h2>
            <button className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--color-accent)' }}>
              + Create Issue
            </button>
          </div>
          <div className="space-y-2">
            {/* Example Issue */}
            <div className="cursor-pointer rounded-lg border p-3 transition-colors hover:border-[var(--color-accent)]" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-muted)' }}>Story</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>3 pts</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Implement n8n webhook triggers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
