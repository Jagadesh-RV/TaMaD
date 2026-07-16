import * as React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'Open dashboard', href: '/' },
  { label: 'Open tasks', href: '/tasks' },
  { label: 'Open planner', href: '/planner' },
  { label: 'Open analytics', href: '/analytics' },
];

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  const filteredActions = actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/35 p-4 pt-24">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-float">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={18} className="text-[color:var(--color-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or jump to…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filteredActions.map((action) => (
            <button
              key={action.href}
              onClick={() => {
                navigate(action.href);
                onClose();
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-hover)]"
            >
              <span>{action.label}</span>
              <ArrowRight size={16} className="text-[color:var(--color-muted)]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
