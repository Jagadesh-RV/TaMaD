import * as React from 'react';
import {
  Search, ArrowRight, LayoutDashboard, CheckSquare, CalendarDays, Map,
  Zap, Target, FileText, PenTool, BarChart3, Bell, Settings, User,
  FolderKanban, TrendingUp, Mail, Brain, Clock, Hash, CornerDownLeft,
  HardDrive, Timer, Trophy, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useNoteStore } from '../../store/noteStore';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';

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
  { label: 'Files', href: '/files', icon: HardDrive, category: 'Pages' },
  { label: 'Whiteboard', href: '/whiteboard', icon: PenTool, category: 'Pages' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, category: 'Pages' },
  { label: 'Reports', href: '/reports', icon: TrendingUp, category: 'Pages' },
  { label: 'AI Assistant', href: '/ai', icon: Brain, category: 'Pages' },
  { label: 'Templates', href: '/templates', icon: FileText, category: 'Pages' },
  { label: 'Notifications', href: '/notifications', icon: Bell, category: 'Pages' },
  { label: 'Settings', href: '/settings', icon: Settings, category: 'Pages' },
  { label: 'Contact Us', href: '/contact', icon: Mail, category: 'Pages' },
];

const TYPE_ICONS: Record<string, typeof FileText> = {
  task: CheckSquare,
  project: FolderKanban,
  note: FileText,
  document: FileText,
  file: HardDrive,
  habit: Timer,
  goal: Trophy,
};

interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'note' | 'document' | 'file' | 'habit' | 'goal';
  title: string;
  subtitle: string;
  href: string;
}

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [serverResults, setServerResults] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setServerResults([]);
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

  // Debounced server search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setServerResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q: query.trim(), workspaceId } });
        setServerResults(data.results || []);
      } catch {
        setServerResults([]);
      }
      setSearching(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, workspaceId]);

  const localResults = React.useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        results.push({
          id: `task_${t._id}`,
          type: 'task',
          title: t.title,
          subtitle: `${t.status.replace('-', ' ')} · ${t.priority}`,
          href: '/tasks',
        });
      }
    });

    projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        results.push({
          id: `project_${p._id}`,
          type: 'project',
          title: p.name,
          subtitle: p.description || 'Project',
          href: '/projects',
        });
      }
    });

    notes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)) {
        results.push({
          id: `note_${n._id}`,
          type: 'note',
          title: n.title,
          subtitle: n.content ? n.content.replace(/[#*_`]/g, '').slice(0, 60) + '...' : 'Note',
          href: '/notes',
        });
      }
    });

    documents.forEach(d => {
      if (d.title.toLowerCase().includes(q) || d.content?.toLowerCase().includes(q)) {
        results.push({
          id: `doc_${d._id}`,
          type: 'document',
          title: d.title,
          subtitle: d.content ? d.content.replace(/[#*_`]/g, '').slice(0, 60) + '...' : 'Document',
          href: '/documents',
        });
      }
    });

    return results.slice(0, 20);
  }, [query, tasks, projects, notes, documents]);

  // Merge: server results fill gaps not found locally
  const allSearchResults = React.useMemo(() => {
    const localIds = new Set(localResults.map(r => r.id));
    const merged = [...localResults];
    serverResults.forEach(sr => {
      if (!localIds.has(sr.id)) merged.push(sr);
    });
    return merged.slice(0, 25);
  }, [localResults, serverResults]);

  const filteredPages = React.useMemo(() => {
    if (!query.trim()) return pageActions;
    return pageActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const allResults = React.useMemo(() => {
    const items: Array<{ type: 'page' | 'search'; data: any }> = [];
    if (allSearchResults.length > 0) {
      allSearchResults.forEach(r => items.push({ type: 'search' as const, data: { ...r, icon: TYPE_ICONS[r.type] || FileText } }));
    }
    filteredPages.forEach(p => items.push({ type: 'page' as const, data: p }));
    return items;
  }, [allSearchResults, filteredPages]);

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
            placeholder="Search tasks, projects, notes, files..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-foreground)' }}
          />
          {searching && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-muted)' }} />}
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
              {query.trim() ? `No results found for "${query}"` : 'Start typing to search...'}
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
                    {item.data.type && item.data.type !== 'page' && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                      >
                        {item.data.type}
                      </span>
                    )}
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
