import * as React from 'react';
import {
  Search, ArrowRight, LayoutDashboard, CheckSquare, CalendarDays, Map,
  Zap, Target, FileText, PenTool, BarChart3, Bell, Settings, User,
  FolderKanban, TrendingUp, Mail, Brain, Clock, Hash, CornerDownLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useNoteStore } from '../../store/noteStore';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';

const pageActions = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'Pages' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, category: 'Pages' },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays, category: 'Pages' },
  { label: 'Projects', href: '/projects', icon: FolderKanban, category: 'Pages' },
  { label: 'Roadmap', href: '/roadmap', icon: Map, category: 'Pages' },
  { label: 'Focus Mode', href: '/focus', icon: Zap, category: 'Pages' },
  { label: 'Planner', href: '/planner', icon: Target, category: 'Pages' },
  { label: 'Notes', href: '/notes', icon: FileText, category: 'Pages' },
  { label: 'Documents', href: '/documents', icon: FileText, category: 'Pages' },
  { label: 'Whiteboard', href: '/whiteboard', icon: PenTool, category: 'Pages' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, category: 'Pages' },
  { label: 'Reports', href: '/reports', icon: TrendingUp, category: 'Pages' },
  { label: 'AI Assistant', href: '/ai', icon: Brain, category: 'Pages' },
  { label: 'Notifications', href: '/notifications', icon: Bell, category: 'Pages' },
  { label: 'Profile', href: '/profile', icon: User, category: 'Pages' },
  { label: 'Settings', href: '/settings', icon: Settings, category: 'Pages' },
  { label: 'Contact Us', href: '/contact', icon: Mail, category: 'Pages' },
];

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  href: string;
  category: string;
}

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';
  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { notes } = useNoteStore();
  const { documents } = useDocumentStore();

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
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

  const searchResults = React.useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        results.push({
          id: `task_${t._id}`,
          title: t.title,
          subtitle: `${t.status.replace('-', ' ')} · ${t.priority}`,
          icon: CheckSquare,
          href: '/tasks',
          category: 'Tasks',
        });
      }
    });

    projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        results.push({
          id: `project_${p._id}`,
          title: p.name,
          subtitle: p.description || 'Project',
          icon: FolderKanban,
          href: '/projects',
          category: 'Projects',
        });
      }
    });

    notes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)) {
        results.push({
          id: `note_${n._id}`,
          title: n.title,
          subtitle: n.content ? n.content.slice(0, 60) + '...' : 'Note',
          icon: FileText,
          href: '/notes',
          category: 'Notes',
        });
      }
    });

    documents.forEach(d => {
      if (d.title.toLowerCase().includes(q) || d.content?.toLowerCase().includes(q)) {
        results.push({
          id: `doc_${d._id}`,
          title: d.title,
          subtitle: d.content ? d.content.replace(/[#*_`]/g, '').slice(0, 60) + '...' : 'Document',
          icon: FileText,
          href: '/documents',
          category: 'Documents',
        });
      }
    });

    return results.slice(0, 20);
  }, [query, tasks, projects, notes, documents]);

  const filteredPages = React.useMemo(() => {
    if (!query.trim()) return pageActions;
    return pageActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const allResults = React.useMemo(() => {
    const items: Array<{ type: 'page' | 'search'; data: any }> = [];
    if (searchResults.length > 0) {
      searchResults.forEach(r => items.push({ type: 'search' as const, data: r }));
    }
    filteredPages.forEach(p => items.push({ type: 'page' as const, data: p }));
    return items;
  }, [searchResults, filteredPages]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      const item = allResults[selectedIndex];
      navigate(item.data.href);
      onClose();
    }
  };

  if (!open) return null;

  let currentCategory = '';

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <Search size={18} style={{ color: 'var(--color-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, projects, notes, pages..."
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
        <div className="max-h-96 overflow-auto p-2" style={{ scrollbarWidth: 'thin' }}>
          {allResults.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
              No results found for "{query}"
            </div>
          ) : (
            allResults.map((item, index) => {
              const Icon = item.data.icon;
              const showCategory = item.data.category !== currentCategory;
              if (showCategory) currentCategory = item.data.category;

              return (
                <React.Fragment key={item.data.id || item.data.href}>
                  {showCategory && (
                    <p
                      className="mb-1 mt-2 px-3 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {item.data.category}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      navigate(item.data.href);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    style={{
                      color: 'var(--color-foreground)',
                      background: index === selectedIndex ? 'var(--color-surface-hover)' : 'transparent',
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Icon size={16} style={{ color: item.type === 'search' ? 'var(--color-accent)' : 'var(--color-muted)' }} />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate font-medium">{item.data.title}</p>
                      {item.data.subtitle && (
                        <p className="truncate text-xs" style={{ color: 'var(--color-muted)' }}>
                          {item.data.subtitle}
                        </p>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <CornerDownLeft size={12} style={{ color: 'var(--color-muted)' }} />
                    )}
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
