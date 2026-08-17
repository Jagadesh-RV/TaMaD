import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import { useAgileStore } from '../store/agileStore';
import IssueDetailModal from '../components/tasks/IssueDetailModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function SortableKanbanItem({ task, onClick }: { task: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`mb-2.5 transition-all outline-none ${isDragging ? 'z-50 scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <Card
        interactive
        className={`p-3.5 border transition-all duration-300 ${isDragging ? 'shadow-float border-[color:var(--color-accent)] bg-[color:var(--color-surface-hover)] ring-2 ring-[color:var(--color-accent-ghost)]' : 'shadow-xs hover:shadow-soft border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)] bg-[color:var(--color-surface)]'}`}
      >
        <div className="mb-3 flex justify-between items-center" {...attributes} {...listeners}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-muted)] bg-[color:var(--color-surface-active)] px-2 py-0.5 rounded-full">{task.taskType || 'Task'}</span>
          <span className="text-[11px] font-bold text-[color:var(--color-muted)] bg-[color:var(--color-surface-active)] px-1.5 py-0.5 rounded-md">{task.storyPoints ? `${task.storyPoints} pts` : ''}</span>
        </div>
        <h4 className="text-[13px] font-semibold leading-snug text-[color:var(--color-foreground)]">{task.title}</h4>
        {task.assignees && task.assignees.length > 0 && (
          <div className="mt-3.5 flex -space-x-1.5 pt-3 border-t border-[color:var(--color-border-light)]">
            {task.assignees.map((a: any) => (
              <div key={a.email} className="h-6 w-6 rounded-full bg-[color:var(--color-accent)] text-white flex items-center justify-center text-[10px] font-bold border-2 border-[color:var(--color-surface)] shadow-xs" title={a.name}>
                {a.name.charAt(0)}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AgileBoardPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { tasks, fetchTasks, updateTask } = useTaskStore();
  const { sprints, fetchSprints, completeSprint } = useAgileStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchTasks(currentWorkspace._id);
      fetchSprints(currentWorkspace._id, '');
    }
  }, [currentWorkspace?._id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  if (!currentWorkspace) return <div className="p-8">Loading...</div>;

  const activeSprint = sprints.find(s => s.status === 'active');
  
  // Show tasks in active sprint. If no active sprint, maybe show an empty state.
  const activeTasks = activeSprint ? tasks.filter(t => t.sprintId === activeSprint._id) : [];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string; // Will be the column ID (e.g. 'todo') or a task in the column

    // Find the task
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Determine target column
    let targetStatus = overId;
    const columns = ['todo', 'in-progress', 'review', 'done'];
    if (!columns.includes(overId)) {
      // dropped over another task, find its status
      const targetTask = tasks.find(t => t._id === overId);
      if (targetTask) targetStatus = targetTask.status;
    }

    if (task.status === targetStatus || !columns.includes(targetStatus)) return; // No change

    // Optimistic Update
    try {
      await updateTask(taskId, { status: targetStatus });
    } catch {
      fetchTasks(currentWorkspace._id); // Revert on failure
    }
  };

  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'In Review' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] p-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Active Sprint</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {activeSprint ? activeSprint.name : 'No active sprint'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeSprint && (
            <button 
              onClick={() => completeSprint(activeSprint._id)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 text-white" 
              style={{ background: 'var(--color-accent)' }}>
              Complete Sprint
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        {!activeSprint ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">No Active Sprint</h2>
              <p className="mt-2 text-[color:var(--color-muted)]">Go to Sprint Planning to start a sprint.</p>
            </div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex h-full min-w-max gap-6">
              {columns.map((col) => {
                const colTasks = activeTasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="flex w-[320px] flex-col">
                    <div className="mb-4 flex items-center justify-between px-2">
                      <h3 className="text-sm font-bold tracking-wide text-[color:var(--color-foreground)]">{col.label}</h3>
                      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-[11px] font-bold shadow-xs bg-[color:var(--color-surface)] text-[color:var(--color-muted)] border border-border">
                        {colTasks.length}
                      </span>
                    </div>
                    
                    <SortableContext items={colTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                      <div className="flex-1 rounded-3xl border-2 border-transparent bg-[color:var(--color-surface-active)] p-2.5 flex flex-col gap-1 min-h-[400px]" id={col.id}>
                        {colTasks.length === 0 ? (
                          <div className="flex h-full min-h-[100px] items-center justify-center border-2 border-dashed rounded-2xl opacity-50 m-1 bg-[color:var(--color-background)] border-[color:var(--color-border-light)]">
                            <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">Drop tasks here</p>
                          </div>
                        ) : (
                          colTasks.map(task => (
                            <SortableKanbanItem key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>
          </DndContext>
        )}
      </div>
      
      <IssueDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialData={selectedTask}
      />
    </div>
  );
}
