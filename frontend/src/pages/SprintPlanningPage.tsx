import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import { useAgileStore } from '../store/agileStore';
import IssueDetailModal from '../components/tasks/IssueDetailModal';
import TaskModal from '../components/tasks/TaskModal';
import { DndContext, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import SprintModal from '../components/tasks/SprintModal';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { ContextMenu } from '../components/ui/ContextMenu';
import { GripVertical, Plus, Rocket, ListTodo, Archive } from 'lucide-react';
import clsx from 'clsx';
import EmptyState from '../components/ui/EmptyState';

function DroppableContainer({ id, children, className, style }: { id: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'Container', containerId: id }
  });
  return (
    <div ref={setNodeRef} id={id} className={clsx(className, "transition-colors", isOver && 'bg-surface-active')} style={style}>
      {children}
    </div>
  );
}

function SortableTaskItem({ task, onClick }: { task: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task._id,
    data: { type: 'Task', task }
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group relative bg-surface border border-border rounded-xl p-3 mb-2 shadow-xs transition-all cursor-pointer hover:border-accent hover:shadow-soft",
        isDragging && "z-50 shadow-float scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between" {...attributes} {...listeners}>
        <div className="flex items-center gap-1.5">
          <GripVertical size={13} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-muted shrink-0" />
          <span className="px-2 py-0.5 rounded-[6px] bg-surface-active text-foreground-tertiary text-[9px] font-bold uppercase tracking-widest">{task.taskType || 'Task'}</span>
        </div>
        <span className="text-[10px] font-bold text-muted">{task.storyPoints ? `${task.storyPoints} pts` : '-'}</span>
      </div>
      <p className="text-[13px] font-medium text-foreground leading-snug ml-1">{task.title}</p>
      <div className="mt-2.5 flex items-center justify-between ml-1">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-hover border border-border text-foreground-tertiary font-bold uppercase tracking-widest">{task.status.replace('-', ' ')}</span>
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.map((a: any) => (
              <div key={a.email} className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[9px] font-bold border border-surface shadow-sm" title={a.name}>
                {a.name.charAt(0).toUpperCase()}
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
  const { tasks, fetchTasks, loading: tasksLoading, updateTask, createTask } = useTaskStore();
  const { sprints, fetchSprints, startSprint, createSprint } = useAgileStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  const [activeDragTask, setActiveDragTask] = useState<any>(null);
  const [originalSprintId, setOriginalSprintId] = useState<string | null>(null);

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

  if (!currentWorkspace) return null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    if (task) {
      setActiveDragTask(task);
      setOriginalSprintId(task.sprintId || null);
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    let newSprintId: string | null = null;

    if (over.data.current?.type === 'Container') {
      const containerId = over.data.current.containerId;
      newSprintId = containerId === 'backlog' ? null : containerId;
    } else if (over.data.current?.type === 'Task') {
      const overTask = over.data.current.task;
      newSprintId = overTask.sprintId || null;
    } else {
      const overId = over.id as string;
      newSprintId = overId === 'backlog' ? null : overId;
    }

    const task = useTaskStore.getState().tasks.find(t => t._id === taskId);
    if (!task) return;

    const currentSprintId = task.sprintId || null;
    if (currentSprintId === newSprintId) return;

    useTaskStore.setState(s => ({
      tasks: s.tasks.map(t => t._id === taskId ? { ...t, sprintId: newSprintId || undefined } : t)
    }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragTask(null);
    const { active } = event;
    const taskId = active.id as string;

    const task = useTaskStore.getState().tasks.find(t => t._id === taskId);
    if (!task) return;

    const currentSprintId = task.sprintId || null;
    if (originalSprintId === currentSprintId) return;

    try {
      await updateTask(taskId, { sprintId: currentSprintId as any });
    } catch {
      useTaskStore.setState(s => ({
        tasks: s.tasks.map(t => t._id === taskId ? { ...t, sprintId: originalSprintId || undefined } : t)
      }));
      toast.error('Failed to move task');
    }
  };

  const handleCreateSprint = async (data: any) => {
    if (!currentWorkspace) return;
    try {
      await createSprint({
        ...data,
        workspaceId: currentWorkspace._id,
      });
      setIsSprintModalOpen(false);
    } catch (e) {
      // Error handled by store
    }
  };

  const activeSprint = sprints.find(s => s.status === 'active');
  const plannedSprints = sprints.filter(s => s.status === 'planned');
  const backlogTasks = tasks.filter(t => t.status !== 'done' && !t.sprintId);

  return (
    <div className="page flex h-[calc(100vh-80px)] flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-[28px] font-display font-bold text-foreground tracking-tight leading-none mb-1 flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
               <ListTodo size={22} />
             </div>
             Backlog
          </h1>
          <p className="text-[14px] text-foreground-secondary mt-2 pl-[52px]">Plan your sprints and manage the backlog.</p>
        </div>
        <button 
          onClick={() => setIsSprintModalOpen(true)}
          className="btn btn-primary">
          Create Sprint
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
          
          {/* Sprints Area */}
          <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
            
            {activeSprint && (
              <DroppableContainer id={activeSprint._id} className="mb-6 rounded-[24px] border border-border bg-surface p-6 shadow-xs">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-[16px] font-display font-bold text-foreground flex items-center gap-2">
                      {activeSprint.name}
                      <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] uppercase tracking-widest font-bold">Active</span>
                    </h2>
                    <p className="text-[12px] font-medium text-foreground-secondary mt-1">Ends {new Date(activeSprint.endDate).toLocaleDateString()}</p>
                  </div>
                  <button className="btn btn-secondary btn-sm">Complete Sprint</button>
                </div>
                <SortableContext items={tasks.filter(t => t.sprintId === activeSprint._id).map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="min-h-[120px]">
                    {tasks.filter(t => t.sprintId === activeSprint._id).map(task => (
                      <SortableTaskItem key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                    {tasks.filter(t => t.sprintId === activeSprint._id).length === 0 && (
                      <div className="rounded-[16px] border-2 border-dashed border-border p-8 flex items-center justify-center">
                        <p className="text-[12px] font-bold uppercase tracking-widest text-muted">Drop issues here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableContainer>
            )}

            {plannedSprints.map(sprint => (
              <DroppableContainer key={sprint._id} id={sprint._id} className="mb-6 rounded-[24px] border border-border bg-surface p-6 shadow-xs">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-[16px] font-display font-bold text-foreground">{sprint.name}</h2>
                  <button onClick={() => startSprint(sprint._id)} className="btn btn-primary btn-sm">Start Sprint</button>
                </div>
                <SortableContext items={tasks.filter(t => t.sprintId === sprint._id).map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="min-h-[120px]">
                    {tasks.filter(t => t.sprintId === sprint._id).map(task => (
                      <SortableTaskItem key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                    {tasks.filter(t => t.sprintId === sprint._id).length === 0 && (
                      <div className="rounded-[16px] border-2 border-dashed border-border p-8 flex items-center justify-center">
                        <p className="text-[12px] font-bold uppercase tracking-widest text-muted">Plan your sprint here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableContainer>
            ))}
            
            {!activeSprint && plannedSprints.length === 0 && (
               <EmptyState
                  icon={Rocket}
                  title="No Sprints Found"
                  description="Create a sprint to start planning your work."
                  action={{ label: 'Create Sprint', onClick: () => setIsSprintModalOpen(true) }}
               />
            )}
          </div>

          {/* Backlog Area */}
          <div className="w-[380px] bg-surface-hover rounded-[24px] border border-border flex flex-col overflow-hidden shrink-0">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface">
              <h2 className="text-[14px] font-display font-bold text-foreground">Backlog</h2>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="text-[12px] font-bold text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
                <Plus size={14} /> Create Issue
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'none' }}>
              <SortableContext items={backlogTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <DroppableContainer id="backlog" className="min-h-[200px]">
                  {!tasksLoading && backlogTasks.map(task => (
                    <SortableTaskItem key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                  ))}
                  {!tasksLoading && backlogTasks.length === 0 && (
                    <div className="rounded-[16px] border-2 border-dashed border-border p-8 flex items-center justify-center text-center mt-4">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-muted">Backlog is empty</p>
                    </div>
                  )}
                </DroppableContainer>
              </SortableContext>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragTask ? (
            <div className="bg-surface border border-accent rounded-xl p-3 shadow-float w-[320px] opacity-90">
              <div className="mb-2 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-[6px] bg-surface-active text-foreground-tertiary text-[9px] font-bold uppercase tracking-widest">{activeDragTask.taskType || 'Task'}</span>
                <span className="text-[10px] font-bold text-muted">{activeDragTask.storyPoints ? `${activeDragTask.storyPoints} pts` : '-'}</span>
              </div>
              <p className="text-[13px] font-medium text-foreground leading-snug">{activeDragTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <IssueDetailModal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} initialData={selectedTask} />
      
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async (data: any) => {
          await createTask({ ...data, workspaceId: currentWorkspace._id });
        }}
      />

      <SprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onSave={handleCreateSprint}
      />
    </div>
  );
}
