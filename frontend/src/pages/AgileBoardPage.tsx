import { useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';

export default function AgileBoardPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);

  useEffect(() => {
    // In a full implementation, we'd fetch sprints and epics here 
    // and connect to socket.io room for real-time updates
  }, [currentWorkspace?._id]);

  if (!currentWorkspace) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] p-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Active Sprint</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {currentWorkspace.type === 'team' ? 'Team Workspace: ' : 'Personal Workspace: '}{currentWorkspace.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 text-white" style={{ background: 'var(--color-accent)' }}>
            Complete Sprint
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex h-full min-w-max gap-6">
          {['To Do', 'In Progress', 'In Review', 'Done'].map((status) => (
            <div key={status} className="flex w-80 flex-col rounded-xl" style={{ background: 'var(--color-surface-hover)' }}>
              <div className="flex items-center justify-between p-4">
                <h3 className="font-semibold text-[var(--color-foreground)]">{status}</h3>
                <span className="flex h-5 items-center justify-center rounded-full px-2 text-xs font-medium" style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}>
                  0
                </span>
              </div>
              <div className="flex-1 p-2">
                {/* Tasks go here */}
                <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg opacity-50" style={{ borderColor: 'var(--color-border-light)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Drop tasks here</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
