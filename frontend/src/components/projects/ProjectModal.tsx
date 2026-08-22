import React, { useState, useEffect } from 'react';
import { Calendar, AlignLeft, X } from 'lucide-react';
import Drawer from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setStartDate(initialData?.startDate || '');
      setEndDate(initialData?.endDate || '');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, startDate, endDate });
    onClose();
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
               <AlignLeft size={20} />
             </div>
             <div>
               <h2 className="text-[18px] font-display font-semibold text-foreground leading-none">
                 {initialData?._id ? 'Edit project' : 'Create project'}
               </h2>
               <p className="text-[13px] text-foreground-secondary mt-1">Add a new project to your roadmap.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-muted hover:bg-surface-active hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">Project Name</label>
              <Input
                value={name}
                onChange={(e: any) => setName(e.target.value)}
                placeholder="e.g., Q3 Marketing Site Redesign"
                required
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground">Start Date</label>
                <div className="relative">
                  <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e: any) => setStartDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground">End Date</label>
                <div className="relative">
                  <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e: any) => setEndDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-[14px] text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 resize-none"
                placeholder="Add details about this project..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="project-form">{initialData?._id ? 'Save changes' : 'Create project'}</Button>
        </div>
      </div>
    </Drawer>
  );
}
