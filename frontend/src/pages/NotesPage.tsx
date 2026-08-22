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
    <div className="page flex flex-col h-[calc(100vh-64px)] pt-4 pb-0 px-4 lg:px-6">
      
      {/* Knowledge Workspace Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h1 className="text-[24px] font-display font-semibold tracking-tight leading-none text-foreground">
          Knowledge Base
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary shadow-xs"
        >
          <Plus size={14} /> New Note
        </button>
      </div>

      <div className="flex w-full flex-1 overflow-hidden rounded-t-[32px] border border-border shadow-xs bg-surface mb-[-1px]">
        {/* Sidebar: Document List */}
        <aside className={clsx(
          "flex shrink-0 flex-col border-r border-border bg-surface-hover/30",
          activeDoc ? "hidden md:flex md:w-[320px]" : "w-full md:w-[320px]"
        )}>
          <div className="p-4 border-b border-border-light">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-surface border border-border rounded-lg shadow-sm focus-within:border-accent transition-colors">
              <Search size={14} className="text-muted" />
               <input
                 type="text"
                 placeholder="Search documents..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="w-full bg-transparent border-none outline-none text-[13px] font-medium placeholder-muted"
                 aria-label="Search notes"
               />
            </div>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'none' }}>
            {loading && <div className="p-4"><LoadingSpinner text="Loading notes..." /></div>}
            {!loading && filteredNotes?.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center opacity-50">
                <FileText size={24} className="mb-3 text-muted" />
                <p className="text-[13px] font-medium text-foreground">No notes found</p>
              </div>
            )}
            <AnimatePresence>
              {filteredNotes?.map((doc: any, i: number) => {
                const active = activeDoc?._id === doc._id;
                return (
                  <motion.button
                    key={doc._id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    onClick={() => setActiveDoc(doc)}
                    className={clsx(
                      'relative w-full rounded-xl p-3 text-left transition-all duration-200 border',
                      active
                        ? 'bg-surface shadow-sm border-border'
                        : 'border-transparent hover:bg-surface-active',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="notes-active-indicator"
                        className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
                      />
                    )}
                    <h3 className={clsx('truncate text-[14px] font-semibold leading-tight', active ? 'text-foreground' : 'text-foreground-secondary')}>
                      {doc.title || 'Untitled Document'}
                    </h3>
                    <p className="mt-1 text-[11px] font-medium text-muted truncate line-clamp-1">
                      {doc.content ? doc.content.replace(/<[^>]*>?/gm, '').substring(0, 60) : 'Empty note...'}
                    </p>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main Editor Area */}
        <div className={clsx(
          "relative flex min-w-0 flex-1 flex-col bg-surface",
          !activeDoc && "hidden md:flex"
        )}>
          {activeDoc ? (
            <>
              {/* Editor Toolbar (Floating style) */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex h-12 items-center justify-between rounded-full border border-border bg-surface/80 px-4 backdrop-blur-md shadow-float gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveDoc(null)}
                    className="mr-2 rounded-full p-1.5 text-muted hover:bg-surface-active md:hidden"
                  >
                    <FileText size={16} />
                  </button>
                  <div className="flex items-center gap-1 pr-3 border-r border-border-light">
                    {[Bold, Italic].map((Icon, idx) => (
                      <button key={idx} className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-active hover:text-foreground">
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[List, CheckSquare].map((Icon, idx) => (
                    <button key={idx} className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-active hover:text-foreground">
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
                <div className="ml-2 flex items-center gap-2 pl-3 border-l border-border-light">
                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Saved
                  </span>
                   <button className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-active hover:text-foreground">
                     <MoreVertical size={14} />
                   </button>
                </div>
              </div>

              {/* Editor Canvas (Fluid, block-based feel) */}
              <div className="flex flex-1 justify-center overflow-y-auto pt-24 pb-32 px-6 md:px-12" style={{ scrollbarWidth: 'thin' }}>
                <div className="w-full max-w-3xl">
                   <input
                     type="text"
                     value={activeDoc.title || ''}
                     onChange={(e) => handleUpdateTitle(e.target.value)}
                     className="mb-8 w-full border-none bg-transparent text-[42px] font-display font-semibold tracking-tight leading-none text-foreground outline-none placeholder:text-muted"
                     placeholder="Untitled Document"
                     aria-label="Document title"
                   />
                  <textarea
                    value={activeDoc.content || ''}
                    onChange={(e) => handleUpdateContent(e.target.value)}
                    className="h-full min-h-[600px] w-full resize-none border-none bg-transparent text-[16px] leading-relaxed text-foreground-secondary outline-none placeholder:text-muted"
                    placeholder="Press '/' for commands or start typing..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-surface-hover/30">
              <EmptyState
                icon={FileText}
                title="Start writing"
                description="Your knowledge base is a quiet place to capture ideas, decisions, and research."
                action={{ label: 'Create new note', onClick: () => setIsModalOpen(true) }}
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
