import * as React from 'react';
import {
  Search, ArrowRight, LayoutDashboard, CheckSquare, CalendarDays, Map,
  Zap, Target, FileText, PenTool, BarChart3, Bell, Settings, User,
  FolderKanban, TrendingUp, Mail,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Roadmap', href: '/roadmap', icon: Map },
  { label: 'Focus Mode', href: '/focus', icon: Zap },
  { label: 'Planner', href: '/planner', icon: Target },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Whiteboard', href: '/whiteboard', icon: PenTool },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Reports', href: '/reports', icon: TrendingUp },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Contact Us', href: '/contact', icon: Mail },
];

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <Search size={18} style={{ color: 'var(--color-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-foreground)' }}
          />
          <kbd
            className="rounded border px-1.5 py-0.5 text-[10px] font-medium"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
              No results found for "{query}"
            </div>
          ) : (
            filtered.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => {
                    navigate(action.href);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--color-foreground)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={16} style={{ color: 'var(--color-muted)' }} />
                  <span className="flex-1 text-left">{action.label}</span>
                  <ArrowRight size={14} style={{ color: 'var(--color-muted)' }} />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
