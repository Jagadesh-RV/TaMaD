import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import { useAgileStore } from '../store/agileStore';
import IssueDetailModal from '../components/tasks/IssueDetailModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

function SortableTaskItem({ task, onClick }: { task: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div 
      ref={setNodeRef}
      style={{ ...style, background: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}
      className="mb-2 cursor-pointer rounded-lg border p-3 transition-colors hover:border-[var(--color-accent)]" 
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between" {...attributes} {...listeners}>
        <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-muted)' }}>{task.taskType || 'Task'}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{task.storyPoints ? `${task.storyPoints} pts` : '-'}</span>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded bg-[color:var(--color-surface-hover)]" style={{ color: 'var(--color-muted)' }}>{task.status}</span>
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.map((a: any) => (
              <div key={a.email} className="h-5 w-5 rounded-full bg-[color:var(--color-accent)] text-white flex items-center justify-center text-[10px] font-bold border border-[color:var(--color-surface)]" title={a.name}>
                {a.name.charAt(0)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SprintPlanningPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { tasks, fetchTasks, loading: tasksLoading, updateTask } = useTaskStore();
  const { sprints, fetchSprints, startSprint, createSprint } = useAgileStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchTasks(currentWorkspace._id);
      fetchSprints(currentWorkspace._id, ''); // Fetch all sprints for workspace for now
    }
  }, [currentWorkspace?._id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  if (!currentWorkspace) return <div className="p-8 text-[color:var(--color-muted)]">Loading workspace...</div>;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string; // Could be 'backlog' or a sprintId

    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const currentSprintId = task.sprintId || 'backlog';
    if (currentSprintId === overId) return; // No change

    // Optimistic UI update
    const newSprintId = overId === 'backlog' ? undefined : overId;
    
    try {
      await updateTask(taskId, { sprintId: newSprintId });
      toast.success('Task moved');
    } catch {
      fetchTasks(currentWorkspace._id); // Revert on failure
    }
  };

  const activeSprint = sprints.find(s => s.status === 'active');
  const plannedSprints = sprints.filter(s => s.status === 'planned');
  
  // Filter backlog tasks (tasks not in done status, and not in any active/planned sprint shown)
  const backlogTasks = tasks.filter(t => t.status !== 'done' && !t.sprintId);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] p-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Backlog & Planning</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Plan your sprints for {currentWorkspace.name}
          </p>
        </div>
        <button 
          onClick={() => createSprint({ name: `Sprint ${sprints.length + 1}`, workspaceId: currentWorkspace._id, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 14*24*60*60*1000).toISOString() })}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 text-white" 
          style={{ background: 'var(--color-accent)' }}>
          Create Sprint
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          {/* Sprints Area */}
          <div className="flex-1 overflow-y-auto p-6" style={{ borderRight: '1px solid var(--color-border-light)' }}>
            
            {activeSprint && (
              <div className="mb-6 rounded-xl border border-[var(--color-border-light)] p-5" style={{ background: 'var(--color-surface)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>{activeSprint.name} <span className="ml-2 text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">Active</span></h2>
                    <p className="text-xs text-[var(--color-muted)]">Ends {new Date(activeSprint.endDate).toLocaleDateString()}</p>
                  </div>
                  <button className="text-sm rounded border px-3 py-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border-light)]">Complete Sprint</button>
                </div>
                <SortableContext items={tasks.filter(t => t.sprintId === activeSprint._id).map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="min-h-[100px]" id={activeSprint._id}>
                    {tasks.filter(t => t.sprintId === activeSprint._id).map(task => (
                      <SortableTaskItem key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                    {tasks.filter(t => t.sprintId === activeSprint._id).length === 0 && (
                      <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Drag issues here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            )}

            {plannedSprints.map(sprint => (
              <div key={sprint._id} className="mb-6 rounded-xl border border-[var(--color-border-light)] p-5" style={{ background: 'var(--color-surface)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>{sprint.name}</h2>
                  <button 
                    onClick={() => startSprint(sprint._id)}
                    className="text-sm rounded border px-3 py-1 bg-[var(--color-accent)] text-white hover:opacity-90 border-[var(--color-accent)]">Start Sprint</button>
                </div>
                <SortableContext items={tasks.filter(t => t.sprintId === sprint._id).map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="min-h-[100px]" id={sprint._id}>
                    {tasks.filter(t => t.sprintId === sprint._id).map(task => (
                      <SortableTaskItem key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                    {tasks.filter(t => t.sprintId === sprint._id).length === 0 && (
                      <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Plan your sprint here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
            
            {!activeSprint && plannedSprints.length === 0 && (
               <div className="rounded-xl border border-[var(--color-border-light)] p-12 text-center" style={{ background: 'var(--color-surface)' }}>
                 <h2 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>No Sprints Found</h2>
                 <p className="mt-2 text-[var(--color-muted)]">Create a sprint to start planning your work.</p>
               </div>
            )}
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
              {tasksLoading && <p className="text-sm text-[color:var(--color-muted)]">Loading backlog...</p>}
              <SortableContext items={backlogTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <div className="min-h-[200px]" id="backlog">
                  {!tasksLoading && backlogTasks.map(task => (
                    <SortableTaskItem key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>
      </DndContext>

      <IssueDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialData={selectedTask}
      />
    </div>
  );
}
