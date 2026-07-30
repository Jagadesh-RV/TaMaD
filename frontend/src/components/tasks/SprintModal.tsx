import { useState, useEffect } from 'react';
import { X, Calendar, Flag } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function SprintModal({
  isOpen = true,
  onClose,
  onSave,
  initialData,
}: any) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setStartDate(initialData?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
      
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      setEndDate(initialData?.endDate?.split('T')[0] || twoWeeksFromNow.toISOString().split('T')[0]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      startDate: new Date(startDate).toISOString(), 
      endDate: new Date(endDate).toISOString() 
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogPanel>
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-[color:var(--color-surface-hover)] p-2 text-[color:var(--color-muted)]"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]">
            <Flag size={20} />
          </div>
          <div>
            <DialogTitle>{initialData?._id ? 'Edit Sprint' : 'Create Sprint'}</DialogTitle>
            <DialogDescription>Plan your next development cycle.</DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-foreground)]">Sprint Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sprint 1" required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-foreground)]">Start Date</label>
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]" />
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-foreground)]">End Date</label>
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]" />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10" required />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} className="sm:w-auto">Cancel</Button>
            <Button type="submit" className="sm:w-auto">Save Sprint</Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
