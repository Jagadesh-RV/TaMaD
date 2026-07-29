import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import IssueDetailModal from '../components/tasks/IssueDetailModal';

export default function SprintPlanningPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { tasks, fetchTasks, loading } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchTasks(currentWorkspace._id);
    }
  }, [currentWorkspace?._id]);

  if (!currentWorkspace) return <div className="p-8 text-[color:var(--color-muted)]">Loading workspace...</div>;

  const backlogTasks = tasks.filter(t => t.status !== 'done');

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
            {loading && <p className="text-sm text-[color:var(--color-muted)]">Loading backlog...</p>}
            {!loading && backlogTasks.map(task => (
              <div 
                key={task._id}
                onClick={() => setSelectedTask(task)}
                className="cursor-pointer rounded-lg border p-3 transition-colors hover:border-[var(--color-accent)]" 
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-muted)' }}>{task.taskType || 'Task'}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{task.storyPoints ? `${task.storyPoints} pts` : '-'}</span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{task.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-[color:var(--color-surface-hover)]" style={{ color: 'var(--color-muted)' }}>{task.status}</span>
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex -space-x-1">
                      {task.assignees.map(a => (
                        <div key={a.email} className="h-5 w-5 rounded-full bg-[color:var(--color-accent)] text-white flex items-center justify-center text-[10px] font-bold border border-[color:var(--color-surface)]" title={a.name}>
                          {a.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IssueDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialData={selectedTask}
      />
    </div>
  );
}
