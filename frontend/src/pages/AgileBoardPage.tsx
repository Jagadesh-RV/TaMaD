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
import {
  CheckSquare, Zap, AlertTriangle, Flag, GripVertical, Plus,
  ChevronRight, Rocket,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { SkeletonKanban } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const PRIORITY_COLORS: Record<string, { dot: string; label: string }> = {
  urgent: { dot: 'priority-dot-urgent', label: 'Urgent' },
  high:   { dot: 'priority-dot-high',   label: 'High' },
  medium: { dot: 'priority-dot-medium', label: 'Medium' },
  low:    { dot: 'priority-dot-low',    label: 'Low' },
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pConf = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;
  const today = format(new Date(), 'yyyy-MM-dd');
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      className={clsx('kanban-card group', isDragging && 'z-50 scale-[1.02]')}
      style={{
        ...style,
        borderLeft: `2.5px solid ${
          task.priority === 'urgent' ? 'var(--color-danger)' :
          task.priority === 'high'   ? 'var(--color-warning)' :
          task.priority === 'medium' ? 'var(--color-accent)' :
          'var(--color-border)'
        }`,
        boxShadow: isDragging ? 'var(--shadow-lg)' : undefined,
      }}
      onClick={onClick}
    >
      {/* Drag handle + type */}
      <div className="flex items-center justify-between mb-2.5" {...attributes} {...listeners}>
        <div className="flex items-center gap-1.5">
          <GripVertical
            size={13}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0"
            style={{ color: 'var(--color-foreground-tertiary)' }}
          />
          {task.taskType && (
            <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'var(--color-surface-active)',
                color: 'var(--color-foreground-tertiary)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
              }}>
              {task.taskType}
            </span>
          )}
        </div>
        {task.storyPoints > 0 && (
          <span className="text-[11px] font-bold"
            style={{
              background: 'var(--color-accent-ghost)',
              color: 'var(--color-accent)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
            }}>
            {task.storyPoints}sp
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-[13px] font-medium leading-snug mb-2.5"
        style={{ color: 'var(--color-foreground)' }}>
        {task.title}
      </h4>

      {/* Bottom: due date + assignees + priority */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2"
        style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span className={clsx('priority-dot shrink-0', pConf.dot)} />
          {/* Due date */}
          {task.dueDate && (
            <span className="text-[11px] font-medium"
              style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-foreground-tertiary)' }}>
              {isOverdue ? 'Overdue' : format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
        {/* Assignee avatars */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="avatar-stack">
            {task.assignees.slice(0, 3).map((a: any) => (
              <div
                key={a.email}
                className="avatar avatar-xs"
                title={a.name}
                style={{ background: 'var(--color-accent)', color: '#fff', border: '1.5px solid var(--color-surface)' }}
              >
                {a.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgileBoardPage() {
  const navigate = useNavigate();
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
        <div className="mb-6">
          <div className="skeleton rounded h-7 w-48 mb-2" />
          <div className="skeleton rounded h-4 w-64" />
        </div>
        <SkeletonKanban columns={4} cardsPerCol={3} />
      </div>
    );
  }

  return (
    <div className="page pb-4">
      {/* Sprint header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="page-title">Active Sprint</h1>
              {activeSprint && (
                <span className="badge badge-accent">{activeSprint.name}</span>
              )}
            </div>
            <p className="page-subtitle">
              {activeSprint
                ? `${activeTasks.length} tasks in sprint`
                : 'No active sprint'}
              {overdueTasks > 0 && (
                <span style={{ color: 'var(--color-danger)' }}>
                  {' '}· {overdueTasks} overdue
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/agile/planning')}
              className="btn btn-sm btn-secondary"
            >
              Backlog
            </button>
            {activeSprint && (
              <button
                onClick={() => completeSprint(activeSprint._id)}
                className="btn btn-sm btn-primary"
              >
                Complete Sprint
              </button>
            )}
          </div>
        </div>

        {/* Sprint progress bar */}
        {activeSprint && activeTasks.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="progress-bar flex-1" style={{ height: 6 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progress}%`,
                  background: progress === 100
                    ? 'var(--color-success)'
                    : 'var(--color-accent)',
                }}
              />
            </div>
            <span className="text-[12px] font-semibold shrink-0" style={{ color: 'var(--color-foreground-secondary)' }}>
              {doneCount}/{activeTasks.length} done · {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Board */}
      {!activeSprint ? (
        <EmptyState
          icon={Rocket}
          title="No Active Sprint"
          description="Start a sprint in the Backlog to see tasks here."
          action={{ label: 'Go to Backlog', onClick: () => navigate('/agile/planning') }}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-6" style={{ alignItems: 'flex-start' }}>
            {COLUMNS.map((col) => {
              const colTasks = activeTasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="shrink-0" style={{ width: 300, minWidth: 300 }}>
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block rounded-full"
                        style={{ width: 8, height: 8, background: col.color }}
                      />
                      <span className="kanban-column-title" style={{ color: col.color }}>
                        {col.label}
                      </span>
                      <span className="kanban-column-count">{colTasks.length}</span>
                    </div>
                    <button
                      className="btn-icon-xs btn-ghost"
                      style={{ color: 'var(--color-foreground-tertiary)' }}
                      aria-label={`Add task to ${col.label}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Column drop zone */}
                  <SortableContext items={colTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    <div
                      className="flex flex-col gap-2.5 rounded-xl p-2.5"
                      id={col.id}
                      style={{
                        background: 'var(--color-surface-active)',
                        minHeight: 320,
                        border: '1px solid var(--color-border-light)',
                      }}
                    >
                      {colTasks.length === 0 ? (
                        <div
                          className="flex items-center justify-center rounded-lg m-1"
                          style={{
                            minHeight: 80,
                            border: '1.5px dashed var(--color-border)',
                            color: 'var(--color-foreground-tertiary)',
                          }}
                        >
                          <span className="text-[11px] font-medium">Drop tasks here</span>
                        </div>
                      ) : (
                        colTasks.map(task => (
                          <SortableKanbanItem
                            key={task._id}
                            task={task}
                            onClick={() => setSelectedTask(task)}
                          />
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

      <IssueDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialData={selectedTask}
      />
    </div>
  );
}
