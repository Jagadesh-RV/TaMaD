import React, { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import Drawer from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: any) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content: '' });
    onClose();
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
               <FileText size={20} />
             </div>
             <div>
               <h2 className="text-[18px] font-display font-semibold text-foreground leading-none">
                 New Note
               </h2>
               <p className="text-[13px] text-foreground-secondary mt-1">Create a new document.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-muted hover:bg-surface-active hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <form id="note-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">Document Title</label>
              <Input
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
                placeholder="e.g., Q3 Meeting Notes"
                required
                autoFocus
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="note-form">Create note</Button>
        </div>
      </div>
    </Drawer>
  );
}
