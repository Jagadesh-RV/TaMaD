import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import IssueDetailModal from '../components/tasks/IssueDetailModal';

export default function AgileBoardPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { tasks, fetchTasks } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchTasks(currentWorkspace._id);
    }
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
          {[
            { id: 'todo', label: 'To Do' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'review', label: 'In Review' },
            { id: 'done', label: 'Done' }
          ].map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="flex w-80 flex-col rounded-xl" style={{ background: 'var(--color-surface-hover)' }}>
                <div className="flex items-center justify-between p-4">
                  <h3 className="font-semibold text-[var(--color-foreground)]">{col.label}</h3>
                  <span className="flex h-5 items-center justify-center rounded-full px-2 text-xs font-medium" style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 p-2 flex flex-col gap-2">
                  {colTasks.length === 0 ? (
                    <div className="flex h-full min-h-[100px] items-center justify-center border-2 border-dashed rounded-lg opacity-50" style={{ borderColor: 'var(--color-border-light)' }}>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Drop tasks here</p>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div 
                        key={task._id} 
                        onClick={() => setSelectedTask(task)}
                        className="cursor-pointer rounded-lg border p-3 bg-[color:var(--color-surface)] shadow-sm hover:border-[color:var(--color-accent)] transition-colors"
                        style={{ borderColor: 'var(--color-border-light)' }}
                      >
                        <div className="mb-2 flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">{task.taskType || 'Task'}</span>
                          <span className="text-xs text-[color:var(--color-muted)]">{task.storyPoints ? `${task.storyPoints} pts` : ''}</span>
                        </div>
                        <h4 className="text-sm font-medium text-[color:var(--color-foreground)]">{task.title}</h4>
                        {task.assignees && task.assignees.length > 0 && (
                          <div className="mt-3 flex -space-x-1">
                            {task.assignees.map(a => (
                              <div key={a.email} className="h-5 w-5 rounded-full bg-[color:var(--color-accent)] text-white flex items-center justify-center text-[10px] font-bold border border-[color:var(--color-surface)]" title={a.name}>
                                {a.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
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
