import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, SortAsc, SortDesc, Trash2, Archive,
  ArchiveRestore, Edit3, Clock, Inbox, Filter, MoreVertical,
} from 'lucide-react';
import clsx from 'clsx';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

type SortField = 'title' | 'updatedAt' | 'createdAt';

export default function DocumentsPage() {
  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';
  const {
    documents, loading, searchQuery, sortBy, sortDir,
    fetchDocuments, createDocument, deleteDocument, archiveDocument,
    setSearchQuery, setSortBy, toggleSortDir,
  } = useDocumentStore();

  const [showArchived, setShowArchived] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (workspaceId) fetchDocuments(workspaceId);
  }, [workspaceId, fetchDocuments]);

  const filteredDocuments = useMemo(() => {
    let docs = showArchived
      ? documents
      : documents.filter(d => !d.isArchived);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q)
      );
    }

    docs.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return docs;
  }, [documents, searchQuery, sortBy, sortDir, showArchived]);

  const archivedCount = useMemo(() => documents.filter(d => d.isArchived).length, [documents]);

  const handleCreate = useCallback(async () => {
    if (!workspaceId) return;
    setCreating(true);
    try {
      await createDocument({ title: 'Untitled Document', content: '', workspaceId });
    } finally {
      setCreating(false);
    }
  }, [workspaceId, createDocument]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page flex flex-col min-h-[calc(100vh-64px)] p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--color-muted)' }}>
            Knowledge base
          </p>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">
            Create, organize, and collaborate on documents.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="btn btn-primary">
          <Plus size={16} />
          New Document
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={clsx('btn btn-sm', showArchived ? 'btn-primary' : 'btn-ghost')}
          >
            <Archive size={14} />
            Archived {archivedCount > 0 && `(${archivedCount})`}
          </button>
           <button onClick={toggleSortDir} className="btn btn-ghost btn-sm" title="Toggle sort" aria-label="Toggle sort direction">
            {sortDir === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="input text-sm"
            style={{ width: 'auto' }}
          >
            <option value="updatedAt">Last modified</option>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            key="empty"
            icon={FileText}
            title={searchQuery ? 'No matching documents' : showArchived ? 'No archived documents' : 'No documents yet'}
            description={
              searchQuery
                ? 'Nothing matches your search. Try different terms or widen the net.'
                : showArchived
                  ? 'Archived documents will gather here when you tidy up.'
                  : 'A blank page is a promise. Create the first document and start turning thoughts into artifacts.'
            }
            steps={
              searchQuery
                ? ['Check the spelling of your search terms', 'Try a broader keyword', 'Clear the search filter']
                : ['Click Create Document to open a fresh page', 'Start writing — drafts save automatically', 'Organize with folders and tags as you go']
            }
            action={searchQuery ? undefined : { label: 'Create Document', onClick: handleCreate }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className={clsx(
                  'group relative rounded-xl border p-5 transition-all hover:shadow-soft',
                  doc.isArchived && 'opacity-60'
                )}
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                    >
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                  <div className="relative">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setActiveMenu(activeMenu === doc._id ? null : doc._id);
                       }}
                       className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--color-surface-active)]"
                       style={{ color: 'var(--color-muted)' }}
                       aria-label="Document actions"
                     >
                       <MoreVertical size={16} />
                     </button>
                    {activeMenu === doc._id && (
                      <div
                        className="absolute right-0 top-8 z-50 min-w-[160px] rounded-xl border py-1 shadow-float"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                      >
                        <button
                          onClick={() => { archiveDocument(doc._id); setActiveMenu(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-active)]"
                          style={{ color: 'var(--color-foreground)' }}
                        >
                          {doc.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                          {doc.isArchived ? 'Restore' : 'Archive'}
                        </button>
                        <button
                          onClick={() => { deleteDocument(doc._id); setActiveMenu(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-red-50"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mb-4 line-clamp-3 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {doc.content
                    ? doc.content.replace(/[#*_`~[\]]/g, '').slice(0, 150) + (doc.content.length > 150 ? '...' : '')
                    : 'Empty document'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
                    <Clock size={12} />
                    {formatDate(doc.updatedAt)}
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex gap-1">
                      {doc.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag._id}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {doc.isArchived && (
                  <div
                    className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}
                  >
                    Archived
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
