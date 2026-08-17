import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, MoreVertical, Bold, Italic, List, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useNoteStore } from '../store/noteStore';
import { useAuthStore } from '../store/authStore';
import NoteModal from '../components/notes/NoteModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function NotesPage() {
  const workspace = useAuthStore(s => s.workspace);
  const { notes, fetchNotes, createNote, updateNote, loading } = useNoteStore() as any;
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const workspaceId = workspace?._id || '';

  useEffect(() => {
    if (workspaceId) fetchNotes(workspaceId);
  }, [fetchNotes, workspaceId]);

  // Handle auto-selecting the first note after notes are loaded
  useEffect(() => {
    if (!activeDoc && notes?.length > 0) {
      setActiveDoc(notes[0]);
    }
  }, [notes, activeDoc]);

  const filteredNotes = (notes as any[] | undefined)?.filter((doc: any) =>
    !search || (doc.title || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleSaveNote = async (data: any) => {
    const newNote = await createNote({ ...data, workspaceId });
    if (newNote) {
      setActiveDoc(newNote);
    }
  };

  const handleUpdateContent = (content: string) => {
    if (!activeDoc) return;
    const updated = { ...activeDoc, content };
    setActiveDoc(updated);
    updateNote(activeDoc._id, { content }); // Auto save
  };

  const handleUpdateTitle = (title: string) => {
    if (!activeDoc) return;
    const updated = { ...activeDoc, title };
    setActiveDoc(updated);
    updateNote(activeDoc._id, { title }); // Auto save
  };

  return (
    <div className="page flex h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex w-full overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        {/* Sidebar: Document List — hidden on mobile, shown when activeDoc is null */}
        <aside className={clsx(
          "flex shrink-0 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-background-secondary)]",
          activeDoc ? "hidden md:flex md:w-80" : "w-full md:w-80"
        )}>
          <div className="border-b border-[color:var(--color-border)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-[color:var(--color-foreground)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]">
                  <FileText size={16} />
                </span>
                Knowledge Base
              </h2>
               <button
                 onClick={() => setIsModalOpen(true)}
                 title="New note"
                 className="btn btn-icon-sm bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-light)]"
                 aria-label="New note"
               >
                <Plus size={18} />
              </button>
            </div>
            <div className="search-input bg-[color:var(--color-surface)]">
              <Search size={15} className="text-[color:var(--color-muted)]" />
               <input
                 type="text"
                 placeholder="Search docs..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="text-sm font-medium"
                 aria-label="Search notes"
               />
            </div>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
            {loading && <LoadingSpinner text="Loading notes..." />}
            {!loading && filteredNotes?.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]">
                  <FileText size={24} />
                </div>
                <p className="text-sm font-bold text-[color:var(--color-foreground)]">
                  {notes?.length === 0 ? 'No notes yet' : 'No matching notes'}
                </p>
                <p className="mt-1 text-xs font-medium text-[color:var(--color-muted)]">
                  {notes?.length === 0 ? 'Click + to create your first one.' : 'Try a different search.'}
                </p>
              </div>
            )}
            <AnimatePresence>
              {filteredNotes?.map((doc: any, i: number) => {
                const active = activeDoc?._id === doc._id;
                return (
                  <motion.button
                    key={doc._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    onClick={() => setActiveDoc(doc)}
                    className={clsx(
                      'relative w-full rounded-xl border p-3 text-left transition-all duration-200',
                      active
                        ? 'border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-ghost)] shadow-xs'
                        : 'border-transparent hover:bg-[color:var(--color-surface-active)]',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="notes-active-bar"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[color:var(--color-accent)]"
                      />
                    )}
                    <h3 className={clsx('truncate text-[13px] font-semibold', active ? 'text-[color:var(--color-foreground)]' : 'text-[color:var(--color-foreground)]')}>
                      {doc.title || 'Untitled Document'}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-medium text-[color:var(--color-muted)]">
                      Updated {doc.updatedAt ? format(new Date(doc.updatedAt), 'MMM d, yyyy') : 'Just now'}
                    </p>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main Editor Area */}
        <div className={clsx(
          "relative flex min-w-0 flex-1 flex-col bg-[color:var(--color-background)]",
          !activeDoc && "hidden md:flex"
        )}>
          {activeDoc ? (
            <>
              {/* Editor Toolbar */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 px-4 md:px-6 backdrop-blur-md">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveDoc(null)}
                    className="mr-2 rounded-lg p-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-active)] md:hidden"
                    aria-label="Back to notes list"
                  >
                    <FileText size={16} />
                  </button>
                  <div className="hidden sm:flex items-center gap-1 border-r border-[color:var(--color-border-light)] pr-3">
                    {[Bold, Italic].map((Icon, idx) => (
                      <button key={idx} title={idx === 0 ? 'Bold' : 'Italic'} className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-active)] hover:text-[color:var(--color-foreground)]">
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 pl-3">
                  {[List, CheckSquare].map((Icon, idx) => (
                    <button key={idx} title={idx === 0 ? 'Bullet list' : 'Checklist'} className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-active)] hover:text-[color:var(--color-foreground)]">
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--color-success)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Auto-saved
                  </span>
                   <button className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-active)] hover:text-[color:var(--color-foreground)]" aria-label="More options">
                     <MoreVertical size={16} />
                   </button>
                </div>
              </div>

              {/* Editor Canvas */}
              <div className="flex flex-1 justify-center overflow-y-auto p-6 md:p-10">
                <div className="h-fit w-full max-w-3xl rounded-2xl border border-[color:var(--color-border-light)] bg-[color:var(--color-surface)] p-8 shadow-sm md:p-10">
                   <input
                     type="text"
                     value={activeDoc.title || ''}
                     onChange={(e) => handleUpdateTitle(e.target.value)}
                     className="mb-6 w-full border-none bg-transparent text-3xl font-bold tracking-tight text-[color:var(--color-foreground)] outline-none placeholder:text-[color:var(--color-foreground-tertiary)]"
                     placeholder="Untitled Document"
                     aria-label="Document title"
                   />
                  <textarea
                    value={activeDoc.content || ''}
                    onChange={(e) => handleUpdateContent(e.target.value)}
                    className="h-full min-h-[500px] w-full resize-none border-none bg-transparent leading-relaxed text-[color:var(--color-foreground)] outline-none placeholder:text-[color:var(--color-foreground-tertiary)]"
                    placeholder="Start writing..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={FileText}
                title="Start with a blank page"
                description="Your knowledge base is a quiet place to capture ideas, decisions, and research."
                action={{ label: 'Create a note', onClick: () => setIsModalOpen(true) }}
                steps={['Give your note a title', 'Write freely — it auto-saves', 'Search anytime from the sidebar']}
              />
            </div>
          )}
        </div>
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  );
}
