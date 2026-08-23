import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  CheckSquare,
  FolderKanban,
  FileText,
  HardDrive,
  Users,
  Video,
  LayoutDashboard,
  Sparkles,
  Clock,
  CornerDownLeft,
  Command,
  StickyNote,
  Target,
  Trophy,
  Timer,
  PenTool,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useNoteStore } from '../../store/noteStore';
import { useDocumentStore } from '../../store/documentStore';
import { useFileStore } from '../../store/fileStore';
import { useTeamStore } from '../../store/teamStore';
import { useMeetingStore } from '../../store/meetingStore';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useInteractionStore } from '../../store/interactionStore';
import { buildNav } from '../../lib/navigation';
import { fuzzyScore, fuzzyFilter, matchRanges } from '../../utils/fuzzy';

interface PaletteItem {
  id: string;
  group: string;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  hint?: string;
  keywords?: string;
  run: () => void;
}

const GROUP_ORDER = [
  'Actions',
  'AI',
  'Recent',
  'Search history',
  'Pages',
  'Tasks',
  'Projects',
  'Notes',
  'Documents',
  'Files',
  'Members',
  'Meetings',
];

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const ranges = matchRanges(query, text);
  if (ranges.length === 0) return <>{text}</>;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  ranges.forEach(([s, e], i) => {
    if (s > last) nodes.push(<span key={`p${i}`}>{text.slice(last, s)}</span>);
    nodes.push(
      <span
        key={`m${i}`}
        className="rounded-[3px] bg-[color:var(--color-accent-light)] text-[color:var(--color-accent)]"
      >
        {text.slice(s, e + 1)}
      </span>,
    );
    last = e + 1;
  });
  if (last < text.length) nodes.push(<span key="end">{text.slice(last)}</span>);
  return <>{nodes}</>;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const open = useInteractionStore((s) => s.commandPaletteOpen);
  const close = useInteractionStore((s) => s.closeCommandPalette);
  const openQuickCreate = useInteractionStore((s) => s.openQuickCreate);
  const openInspector = useInteractionStore((s) => s.openInspector);
  const recordVisit = useInteractionStore((s) => s.recordVisit);
  const recents = useInteractionStore((s) => s.recents);
  const recentSearches = useInteractionStore((s) => s.recentSearches);
  const pushRecentSearch = useInteractionStore((s) => s.pushRecentSearch);

  const workspace = useAuthStore((s) => s.workspace);
  const workspaceId = workspace?._id || '';
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const teamId = currentWorkspace?.teamId;
  const isTeam = !!teamId;

  const { tasks, fetchTasks } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { notes, fetchNotes } = useNoteStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const { files, fetchFiles } = useFileStore();
  const { members, getMembers } = useTeamStore();
  const { meetings, fetchMeetings } = useMeetingStore();

  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    if (!workspaceId) return;
    if (tasks.length === 0) fetchTasks(workspaceId);
    if (projects.length === 0) fetchProjects(workspaceId);
    if (notes.length === 0) fetchNotes(workspaceId);
    if (documents.length === 0) fetchDocuments(workspaceId);
    if (files.length === 0) fetchFiles(workspaceId);
    if (teamId) {
      if (members.length === 0) getMembers(teamId);
      if (meetings.length === 0) fetchMeetings(teamId);
    }
  }, [open, workspaceId, teamId, tasks.length, projects.length, notes.length, documents.length, files.length, members.length, meetings.length, fetchTasks, fetchProjects, fetchNotes, fetchDocuments, fetchFiles, getMembers, fetchMeetings]);

  const go = React.useCallback((path: string, label: string, icon: string) => {
    navigate(path);
    recordVisit({ id: `page-${path}`, type: 'page', label, href: path, icon });
    close();
  }, [navigate, recordVisit, close]);

  const runCommand = (run: () => void) => () => {
    const q = query.trim();
    if (q) pushRecentSearch(q);
    run();
  };

  const createCommands = React.useMemo<PaletteItem[]>(() => {
    const make = (
      id: string,
      label: string,
      icon: LucideIcon,
      intent: string,
      hint?: string,
    ): PaletteItem => ({
      id,
      group: 'Actions',
      label,
      icon,
      hint,
      keywords: `create new make add ${intent}`,
      run: () => {
        close();
        openQuickCreate(intent);
      },
    });
    return [
      { id: 'quick-create', group: 'Actions', label: 'Quick create…', icon: Plus, keywords: 'create new add', run: () => { close(); openQuickCreate(); } },
      make('new-task', 'New Task', CheckSquare, 'task', 'C'),
      make('new-project', 'New Project', FolderKanban, 'project', 'C'),
      make('new-meeting', 'New Meeting', Video, 'meeting', 'C'),
      make('new-note', 'New Note', StickyNote, 'note', 'C'),
      make('new-document', 'New Document', FileText, 'document', 'C'),
      make('new-sprint', 'New Sprint', Target, 'sprint', 'C'),
      make('new-goal', 'New Goal', Trophy, 'goal', 'C'),
      make('new-habit', 'New Habit', Timer, 'habit', 'C'),
      make('new-whiteboard', 'New Whiteboard', PenTool, 'whiteboard', 'C'),
    ];
  }, [close, openQuickCreate]);

  const aiCommands = React.useMemo<PaletteItem[]>(() => {
    const mk = (id: string, label: string, subtitle: string, ask: string): PaletteItem => ({
      id,
      group: 'AI',
      label,
      subtitle,
      icon: Sparkles,
      keywords: `ai assistant ${label}`,
      run: () => go(`/ai?ask=${ask}`, 'AI Assistant', 'ai'),
    });
    return [
      mk('ai-next', 'AI: What should I work on next?', 'Prioritize from your open tasks', 'next'),
      mk('ai-summary', 'AI: Summarize my day', 'A quick recap of today’s momentum', 'summary'),
      mk('ai-priorities', 'AI: Review my priorities', 'Spot overdue and high-impact work', 'priorities'),
      mk('ai-blockers', 'AI: Surface blockers', 'Find tasks stuck in review', 'blockers'),
    ];
  }, [go]);

  const pageItems = React.useMemo<PaletteItem[]>(() => {
    const nav = buildNav({ isTeam, teamId: currentWorkspace?.teamId });
    const items: PaletteItem[] = [];
    nav.forEach((section) =>
      section.links.forEach((link) =>
        items.push({
          id: `page-${link.path}`,
          group: 'Pages',
          label: link.label,
          icon: link.icon,
          keywords: `go to open navigate ${link.label}`,
          run: () => go(link.path, link.label, link.path.split('/').filter(Boolean)[0] || 'dashboard'),
        }),
      ),
    );
    return items;
  }, [isTeam, currentWorkspace?.teamId, go]);

  const iconFor = React.useCallback((href: string): LucideIcon => {
    return (buildNav({ isTeam, teamId: currentWorkspace?.teamId })
      .flatMap((s) => s.links)
      .find((l) => l.path === href)?.icon) || LayoutDashboard;
  }, [isTeam, currentWorkspace?.teamId]);

  const typeIcon = React.useCallback((type: string): LucideIcon => {
    const map: Record<string, LucideIcon> = {
      task: CheckSquare,
      project: FolderKanban,
      note: FileText,
      document: FileText,
      member: Users,
      meeting: Video,
    };
    return map[type] || LayoutDashboard;
  }, []);

  const recentItems = React.useMemo<PaletteItem[]>(() => {
    return recents.slice(0, 5).map((r, i) => ({
      id: `recent-${r.id}-${i}`,
      group: 'Recent',
      label: r.label,
      subtitle: 'Recently visited',
      icon: r.type === 'page' ? iconFor(r.href) : typeIcon(r.type),
      hint: '↵',
      run: () => go(r.href, r.label, r.icon),
    }));
  }, [recents, go, iconFor, typeIcon]);

  const historyItems = React.useMemo<PaletteItem[]>(() => {
    return recentSearches.slice(0, 4).map((q) => ({
      id: `history-${q}`,
      group: 'Search history',
      label: q,
      subtitle: 'Search again',
      icon: Clock,
      run: () => {
        setQuery(q);
        inputRef.current?.focus();
      },
    }));
  }, [recentSearches]);

  const entityItems = React.useMemo<PaletteItem[]>(() => {
    if (!query.trim()) return [];
    const items: PaletteItem[] = [];

    fuzzyFilter(tasks, query, (t) => `${t.title} ${t.description || ''}`, 6).forEach((t) =>
      items.push({
        id: `task-${t._id}`,
        group: 'Tasks',
        label: t.title,
        subtitle: `${t.status.replace('-', ' ')} · ${t.priority}`,
        icon: CheckSquare,
        run: () => {
          close();
          openInspector('task', t._id);
        },
      }),
    );

    fuzzyFilter(projects, query, (p) => `${p.name} ${p.description || ''}`, 4).forEach((p) =>
      items.push({
        id: `project-${p._id}`,
        group: 'Projects',
        label: p.name,
        subtitle: p.description || 'Project',
        icon: FolderKanban,
        run: () => go('/projects', p.name, 'project'),
      }),
    );

    fuzzyFilter(notes, query, (n) => `${n.title} ${n.content || ''}`, 4).forEach((n) =>
      items.push({
        id: `note-${n._id}`,
        group: 'Notes',
        label: n.title || 'Untitled note',
        subtitle: n.content ? n.content.replace(/[#*_`]/g, '').slice(0, 50) : 'Note',
        icon: FileText,
        run: () => go('/notes', n.title || 'Untitled note', 'note'),
      }),
    );

    fuzzyFilter(documents, query, (d) => `${d.title} ${d.content || ''}`, 4).forEach((d) =>
      items.push({
        id: `doc-${d._id}`,
        group: 'Documents',
        label: d.title,
        subtitle: d.content ? d.content.replace(/[#*_`]/g, '').slice(0, 50) : 'Document',
        icon: FileText,
        run: () => go('/documents', d.title, 'document'),
      }),
    );

    fuzzyFilter(files, query, (f) => f.originalName, 4).forEach((f) =>
      items.push({
        id: `file-${f._id}`,
        group: 'Files',
        label: f.originalName,
        subtitle: `${(f.size / 1024).toFixed(0)} KB`,
        icon: HardDrive,
        run: () => go('/files', f.originalName, 'file'),
      }),
    );

    fuzzyFilter(members, query, (m) => `${m.userId.name} ${m.userId.email}`, 4).forEach((m) =>
      items.push({
        id: `member-${m._id}`,
        group: 'Members',
        label: m.userId.name,
        subtitle: m.userId.email,
        icon: Users,
        run: () => {
          close();
          openInspector('member', m._id);
        },
      }),
    );

    fuzzyFilter(meetings, query, (m) => `${m.title} ${m.status}`, 4).forEach((m) =>
      items.push({
        id: `meeting-${m._id}`,
        group: 'Meetings',
        label: m.title,
        subtitle: `${m.status} · ${new Date(m.startTime).toLocaleDateString()}`,
        icon: Video,
        run: () => go(`/team/${m.teamId}/meetings`, m.title, 'meeting'),
      }),
    );

    return items;
  }, [query, tasks, projects, notes, documents, files, members, meetings, close, openInspector, go]);

  const smartItems = React.useMemo<PaletteItem[]>(() => {
    if (!query.trim()) {
      return [...createCommands, ...aiCommands, ...recentItems, ...historyItems, ...pageItems];
    }

    const q = query.trim();
    const scored: Array<{ item: PaletteItem; score: number }> = [];

    const consider = (item: PaletteItem) => {
      const hay = `${item.label} ${item.subtitle || ''} ${item.keywords || ''}`;
      const score = fuzzyScore(q, hay);
      if (score !== null) scored.push({ item, score });
    };

    [...createCommands, ...aiCommands, ...entityItems, ...pageItems].forEach(consider);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 30).map((s) => s.item);
  }, [query, createCommands, aiCommands, entityItems, pageItems, recentItems, historyItems]);

  const grouped = React.useMemo(() => {
    const ordered = [...smartItems].sort(
      (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
    );
    const seen = new Set<string>();
    return ordered.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [smartItems]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    listRef.current?.scrollTo({ top: 0 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, grouped.length - 1));
      scrollIntoView(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      scrollIntoView(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      const item = grouped[selectedIndex];
      if (item) runCommand(item.run)();
    } else if (e.key === 'Home') {
      setSelectedIndex(0);
    } else if (e.key === 'End') {
      setSelectedIndex(grouped.length - 1);
    }
  };

  const scrollIntoView = (index: number) => {
    const el = listRef.current?.querySelectorAll<HTMLElement>('[data-palette-item]')[index];
    el?.scrollIntoView({ block: 'nearest' });
  };

  let currentGroup = '';
  const navPages = buildNav({ isTeam, teamId: currentWorkspace?.teamId });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 p-4 pt-[16vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-[var(--shadow-float)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Search size={18} className="shrink-0 text-[color:var(--color-muted)]" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                autoFocus
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search anything, or type a command…"
                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[color:var(--color-foreground-tertiary)]"
                style={{ color: 'var(--color-foreground)' }}
                role="combobox"
                aria-expanded="true"
                aria-controls="command-palette-list"
                aria-autocomplete="list"
              />
              <kbd className="flex items-center gap-0.5 rounded border border-border bg-background-secondary px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-foreground-tertiary)]">
                <Command size={10} />K
              </kbd>
            </div>

            <div ref={listRef} id="command-palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Search size={22} className="text-[color:var(--color-muted)]" />
                  <p className="text-sm font-medium text-[color:var(--color-muted)]">
                    No results for “{query}”
                  </p>
                </div>
              ) : (
                grouped.map((item, index) => {
                  const showHeader = item.group !== currentGroup;
                  if (showHeader) currentGroup = item.group;
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={item.id}>
                      {showHeader && (
                        <p className="mb-1 mt-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-foreground-tertiary)]" role="presentation">
                          {item.group}
                        </p>
                      )}
                      <button
                        data-palette-item
                        role="option"
                        aria-selected={index === selectedIndex}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => runCommand(item.run)()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors"
                        style={{
                          color: 'var(--color-foreground)',
                          background: index === selectedIndex ? 'var(--color-surface-hover)' : 'transparent',
                        }}
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            background: index === selectedIndex ? 'var(--color-accent-ghost)' : 'var(--color-surface-active)',
                          }}
                        >
                          <Icon size={15} style={{ color: index === selectedIndex ? 'var(--color-accent)' : 'var(--color-foreground-secondary)' }} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">
                            <Highlight text={item.label} query={query} />
                          </span>
                          {item.subtitle && (
                            <span className="block truncate text-xs font-medium text-[color:var(--color-muted)]">
                              {item.subtitle}
                            </span>
                          )}
                        </span>
                        {item.hint && (
                          <kbd className="shrink-0 rounded border border-border bg-background-secondary px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--color-foreground-secondary)]">
                            {item.hint}
                          </kbd>
                        )}
                        {index === selectedIndex && (
                          <CornerDownLeft size={13} className="shrink-0 text-[color:var(--color-muted)]" />
                        )}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-border bg-background-secondary/60 px-4 py-2.5 text-[10px] font-semibold text-[color:var(--color-foreground-tertiary)]">
              <span className="flex items-center gap-1"><kbd className="kbd-hint">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="kbd-hint">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="kbd-hint">esc</kbd> close</span>
              <span className="ml-auto flex items-center gap-1.5 text-[color:var(--color-muted)]">
                <Command size={10} /> {navPages.length} pages
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
