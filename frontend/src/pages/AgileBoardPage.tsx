import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import { useAgileStore } from '../store/agileStore';
import IssueDetailModal from '../components/tasks/IssueDetailModal';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Rocket, Flame, LayoutDashboard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { SkeletonKanban } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { useCelebration } from '../hooks/useCelebration';
import { ContextMenu } from '../components/ui/ContextMenu';

const PRIORITY_COLORS: Record<string, { dot: string; label: string }> = {
  urgent: { dot: 'bg-danger', label: 'Urgent' },
  high:   { dot: 'bg-warning',   label: 'High' },
  medium: { dot: 'bg-accent', label: 'Medium' },
  low:    { dot: 'bg-border',    label: 'Low' },
};

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'var(--color-foreground-tertiary)' },
  { id: 'in-progress', label: 'In Progress', color: 'var(--color-info)' },
  { id: 'review',      label: 'In Review',   color: 'var(--color-warning)' },
  { id: 'done',        label: 'Done',        color: 'var(--color-success)' },
];

function SortableKanbanItem({ task, onClick }: { task: any; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });
  const { updateTask, deleteTask } = useTaskStore() as any;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pConf = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;
  const today = format(new Date(), 'yyyy-MM-dd');
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

  return (
    <ContextMenu items={[
      { label: 'Edit Issue', onClick },
      { label: task.status === 'done' ? 'Mark as To Do' : 'Mark as Done', onClick: () => updateTask(task._id, { status: task.status === 'done' ? 'todo' : 'done' }) },
      { divider: true, label: '' },
      { label: 'Delete', danger: true, onClick: () => deleteTask(task._id) }
    ]}>
      <div
        ref={setNodeRef}
        className={clsx(
          'group relative bg-surface border rounded-[16px] p-4 shadow-xs hover:shadow-soft hover:border-border-hover transition-all cursor-pointer',
          isDragging && 'z-50 scale-[1.02] shadow-float',
          task.status === 'done' ? 'border-transparent opacity-70 hover:opacity-100' : 'border-border'
        )}
        style={style}
        onClick={onClick}
      >
        {/* Decorator line for priority */}
        <div 
          className="absolute top-4 bottom-4 left-0 w-1 rounded-r-full"
          style={{ background: task.priority === 'urgent' ? 'var(--color-danger)' : task.priority === 'high' ? 'var(--color-warning)' : task.priority === 'medium' ? 'var(--color-accent)' : 'transparent' }}
        />
        
        {/* Top Handle & Type */}
        <div className="flex items-center justify-between mb-3" {...attributes} {...listeners}>
          <div className="flex items-center gap-1.5 ml-1">
            <GripVertical
              size={13}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 text-muted"
            />
            {task.taskType && (
              <span className="px-2 py-0.5 rounded-[6px] bg-surface-active text-foreground-tertiary text-[10px] font-bold uppercase tracking-widest">
                {task.taskType}
              </span>
            )}
          </div>
          {task.storyPoints > 0 && (
            <span className="px-2 py-0.5 rounded-[6px] bg-accent/10 text-accent text-[11px] font-bold shadow-sm">
              {task.storyPoints}
            </span>
          )}
        </div>

        <h4 className={clsx("text-[13px] font-medium leading-snug mb-3 ml-2", task.status === 'done' && 'line-through text-foreground-tertiary')}>
          {task.title}
        </h4>

        {/* Bottom */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-light ml-2">
          <div className="flex items-center gap-2">
            <span className={clsx('w-2 h-2 rounded-full shrink-0', pConf.dot)} />
            {task.dueDate && (
              <span className={clsx("text-[10px] font-bold uppercase tracking-widest", isOverdue ? 'text-danger' : 'text-foreground-tertiary')}>
                {isOverdue ? 'Overdue' : format(parseISO(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((a: any) => (
                <div
                  key={a.email}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-surface"
                  title={a.name}
                  style={{ background: 'var(--color-accent)' }}
                >
                  {a.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ContextMenu>
  );
}

export default function AgileBoardPage() {
  const navigate = useNavigate();
  const { celebrateMilestone } = useCelebration();
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { tasks, loading: tasksLoading, fetchTasks, updateTask } = useTaskStore();
  const { sprints, loading: sprintsLoading, fetchSprints, completeSprint } = useAgileStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const isLoading = !currentWorkspace || tasksLoading || sprintsLoading;

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchTasks(currentWorkspace._id);
      fetchSprints(currentWorkspace._id, '');
    }
  }, [currentWorkspace?._id, fetchTasks, fetchSprints]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const activeSprint = sprints.find(s => s.status === 'active');
  const activeTasks = activeSprint ? tasks.filter(t => t.sprintId === activeSprint._id) : [];
  const doneCount = activeTasks.filter(t => t.status === 'done').length;
  const progress = activeTasks.length > 0 ? Math.round((doneCount / activeTasks.length) * 100) : 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  const overdueTasks = activeTasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !currentWorkspace) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const colIds = COLUMNS.map(c => c.id);
    let targetStatus = overId;
    if (!colIds.includes(overId)) {
      const targetTask = tasks.find(t => t._id === overId);
      if (targetTask) targetStatus = targetTask.status;
    }

    if (task.status === targetStatus || !colIds.includes(targetStatus)) return;

    try {
      await updateTask(taskId, { status: targetStatus });
    } catch {
      fetchTasks(currentWorkspace._id);
    }
  };

  if (isLoading) {
    return (
      <div className="page pb-20">
        <SkeletonKanban columns={4} cardsPerCol={3} />
      </div>
    );
  }

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-[28px] font-display font-bold text-foreground tracking-tight leading-none mb-1 flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
               <LayoutDashboard size={22} />
             </div>
             Active Sprint
          </h1>
          <div className="text-[14px] text-foreground-secondary mt-2 pl-[52px] flex items-center gap-2">
            {activeSprint ? (
              <>
                <span className="px-2 py-0.5 rounded-md bg-surface-active text-foreground font-semibold border border-border shadow-sm">{activeSprint.name}</span>
                <span>• {activeTasks.length} issues</span>
                {overdueTasks > 0 && <span className="text-danger flex items-center gap-1"><Flame size={12}/> {overdueTasks} overdue</span>}
              </>
            ) : (
              'No active sprint'
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agile/planning')} className="btn btn-secondary">
            View Backlog
          </button>
          {activeSprint && (
            <button onClick={() => {
              completeSprint(activeSprint._id);
              celebrateMilestone('Sprint Complete!', 'Amazing work completing this sprint!');
            }} className="btn btn-primary">
              Complete Sprint
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {activeSprint && activeTasks.length > 0 && (
        <div className="flex items-center gap-4 mb-8 shrink-0">
          <div className="h-2 flex-1 bg-surface-active rounded-full overflow-hidden border border-border">
            <div
              className="h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${progress}%`, background: progress === 100 ? 'var(--color-success)' : 'var(--color-accent)' }}
            />
          </div>
          <span className="text-[12px] font-bold text-foreground-secondary">
            {doneCount}/{activeTasks.length} <span className="opacity-50">done</span>
          </span>
        </div>
      )}

      {/* Kanban Board */}
      {!activeSprint ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyState
            icon={Rocket}
            title="No Active Sprint"
            description="Start a sprint in the Backlog to see tasks here."
            action={{ label: 'Go to Backlog', onClick: () => navigate('/agile/planning') }}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 h-full items-start min-w-max">
              {COLUMNS.map((col) => {
                const colTasks = activeTasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="flex flex-col h-full shrink-0 w-[320px]">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: col.color }} />
                        <span className="text-[13px] font-bold uppercase tracking-widest text-foreground">{col.label}</span>
                        <span className="text-[11px] font-bold text-muted bg-surface-active px-2 py-0.5 rounded-full">{colTasks.length}</span>
                      </div>
                      <button className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-active transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Drop Zone */}
                    <SortableContext items={colTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                      <div
                        id={col.id}
                        className="flex-1 flex flex-col gap-3 rounded-[24px] p-3 overflow-y-auto"
                        style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', scrollbarWidth: 'none' }}
                      >
                        {colTasks.length === 0 ? (
                          <div className="h-24 rounded-[16px] border-2 border-dashed border-border flex items-center justify-center text-muted text-[11px] font-bold uppercase tracking-widest">
                            Drop Here
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
        </div>
      )}

      <IssueDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialData={selectedTask}
      />
    </div>
  );
}
