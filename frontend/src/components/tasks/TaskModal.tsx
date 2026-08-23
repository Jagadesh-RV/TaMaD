import React, { useState, useEffect } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import Drawer from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import TaskComments from './TaskComments';

export default function TaskModal({
  isOpen = true,
  onClose,
  onSave,
  initialData,
}: any) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || initialData?.initialDate || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [status, setStatus] = useState(initialData?.status || 'todo');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setDueDate(initialData?.dueDate || initialData?.initialDate || '');
      setPriority(initialData?.priority || 'medium');
      setStatus(initialData?.status || 'todo');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, dueDate, priority, status });
    onClose();
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
               <Check size={20} />
             </div>
             <div>
               <h2 className="text-[18px] font-display font-semibold text-foreground leading-none">
                 {initialData?._id ? 'Edit task' : 'Create task'}
               </h2>
               <p className="text-[13px] text-foreground-secondary mt-1">Capture the next thing worth doing.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-muted hover:bg-surface-active hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">Title</label>
              <Input value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="Finalize presentation slides" required autoFocus />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">Due date</label>
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input type="date" value={dueDate} onChange={(e: any) => setDueDate(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-[13px] font-medium text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-[13px] font-medium text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-[14px] text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 resize-none"
                placeholder="Add notes, context, or subtasks…"
              />
            </div>
          </form>

          {initialData?._id && (
            <div className="mt-8">
              <h4 className="text-[13px] font-semibold text-foreground mb-3">Activity & Comments</h4>
              <div className="rounded-xl border border-border bg-surface-hover p-1">
                <TaskComments taskId={initialData._id} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="task-form">{initialData?._id ? 'Save changes' : 'Create task'}</Button>
        </div>
      </div>
    </Drawer>
  );
}
