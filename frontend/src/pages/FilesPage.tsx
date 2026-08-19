import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Search, Grid3X3, List, ArrowUpDown, Trash2, Archive,
  RotateCcw, Eye, Download, FolderOpen, Image, FileText, File,
  Film, Music, ArchiveIcon, HardDrive, Folder, ChevronDown,
  X, Loader2, Filter,
} from 'lucide-react';
import clsx from 'clsx';
import { useFileStore } from '../store/fileStore';
import { useAuthStore } from '../store/authStore';
import { useFileUpload, formatFileSize } from '../hooks/useFileUpload';
import FileUpload from '../components/ui/FileUpload';
import EmptyState from '../components/ui/EmptyState';
import { showToast } from '../lib/toast';

const FILE_ICONS: Record<string, typeof File> = {
  image: Image,
  pdf: FileText,
  doc: FileText,
  xls: FileText,
  ppt: FileText,
  video: Film,
  audio: Music,
  archive: ArchiveIcon,
  file: File,
};

function getFileIconComponent(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.startsWith('video/')) return Film;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return ArchiveIcon;
  if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileText;
  return File;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function FilesPage() {
  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';
  const {
    files, stats, loading, searchQuery, sortBy, sortDir, showArchived,
    setSearchQuery, setSortBy, toggleSortDir, toggleShowArchived,
    fetchFiles, createFileMetadata, archiveFile, restoreFile, deleteFile, fetchStats,
  } = useFileStore();
  const { uploadFile } = useFileUpload();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (workspaceId) {
      fetchFiles(workspaceId);
      fetchStats(workspaceId);
    }
  }, [workspaceId, searchQuery, sortBy, sortDir, showArchived]);

  const handleQuickUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !workspaceId) return;

    for (const file of Array.from(fileList)) {
      try {
        const timestamp = Date.now();
        const storagePath = `workspaces/${workspaceId}/files/${timestamp}_${file.name}`;
        const url = await uploadFile(file, storagePath);
        await createFileMetadata({
          originalName: file.name,
          fileName: `${timestamp}_${file.name}`,
          mimeType: file.type,
          size: file.size,
          url,
          storagePath,
          workspaceId,
        });
      } catch (err) {
        showToast.error(`Failed to upload ${file.name}`);
        console.error('File upload failed:', err);
      }
    }

    fetchFiles(workspaceId);
    fetchStats(workspaceId);
    e.target.value = '';
  }, [workspaceId, uploadFile, createFileMetadata, fetchFiles, fetchStats]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!workspaceId) return;

    const fileList = e.dataTransfer.files;
    for (const file of Array.from(fileList)) {
      try {
        const timestamp = Date.now();
        const storagePath = `workspaces/${workspaceId}/files/${timestamp}_${file.name}`;
        const url = await uploadFile(file, storagePath);
        await createFileMetadata({
          originalName: file.name,
          fileName: `${timestamp}_${file.name}`,
          mimeType: file.type,
          size: file.size,
          url,
          storagePath,
          workspaceId,
        });
      } catch (err) {
        showToast.error(`Failed to upload ${file.name}`);
        console.error('File upload failed:', err);
      }
    }

    fetchFiles(workspaceId);
    fetchStats(workspaceId);
  }, [workspaceId, uploadFile, createFileMetadata, fetchFiles, fetchStats]);

  const handleUploadComplete = useCallback(async (urls: string[]) => {
    setShowUploadModal(false);
    fetchFiles(workspaceId);
    fetchStats(workspaceId);
  }, [workspaceId, fetchFiles, fetchStats]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;
    await deleteFile(id);
    fetchStats(workspaceId);
  }, [deleteFile, fetchStats, workspaceId]);

  const handleArchive = useCallback(async (id: string) => {
    await archiveFile(id);
    fetchStats(workspaceId);
  }, [archiveFile, fetchStats, workspaceId]);

  const handleRestore = useCallback(async (id: string) => {
    await restoreFile(id);
    fetchStats(workspaceId);
  }, [restoreFile, fetchStats, workspaceId]);

  const totalSize = stats?.totalSize || 0;
  const totalFiles = stats?.totalFiles || 0;

  return (
    <div
      className="page flex flex-col min-h-[calc(100vh-64px)] p-6 lg:p-8"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--color-muted)' }}>
          Storage
        </p>
        <h1 className="page-title">Files</h1>
        <p className="page-subtitle">Manage your workspace files and attachments.</p>
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-accent-ghost)', color: 'var(--color-accent)' }}>
            <HardDrive size={18} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>{totalFiles}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Total Files</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-info-ghost)', color: 'var(--color-info)' }}>
            <FolderOpen size={18} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>{formatFileSize(totalSize)}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Storage Used</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-success-ghost)', color: 'var(--color-success)' }}>
            <Folder size={18} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>{stats?.byType?.length || 0}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>File Types</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: '240px' }}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="input pl-10 w-full"
          />
        </div>

        <button onClick={() => setSortBy('originalName')} className="btn btn-ghost text-xs gap-1.5">
          <ArrowUpDown size={14} />
          Name {sortBy === 'originalName' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => setSortBy('size')} className="btn btn-ghost text-xs gap-1.5">
          <ArrowUpDown size={14} />
          Size {sortBy === 'size' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>

        <button
          onClick={toggleShowArchived}
          className={clsx('btn text-xs gap-1.5', showArchived ? 'btn-primary' : 'btn-ghost')}
        >
          <Archive size={14} />
          {showArchived ? 'Archived' : 'Archived'}
        </button>

        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setViewMode('grid')}
            className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'btn-primary' : '')}
            style={viewMode !== 'grid' ? { background: 'var(--color-surface)', color: 'var(--color-muted)' } : {}}
            aria-label="Grid view"
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx('p-2 transition-colors', viewMode === 'list' ? 'btn-primary' : '')}
            style={viewMode !== 'list' ? { background: 'var(--color-surface)', color: 'var(--color-muted)' } : {}}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>

        <label className="btn btn-primary cursor-pointer gap-1.5">
          <Upload size={14} />
          Upload
          <input
            type="file"
            multiple
            onChange={handleQuickUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <div className="rounded-2xl border-2 border-dashed p-12 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}>
              <Upload size={48} style={{ color: 'var(--color-accent)' }} className="mx-auto mb-4" />
              <p className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>Drop files to upload</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Release to start uploading</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>Upload Files</h3>
                <button onClick={() => setShowUploadModal(false)} className="rounded p-1" style={{ color: 'var(--color-muted)' }} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <FileUpload
                path={`workspaces/${workspaceId}/files`}
                accept="all"
                multiple
                maxSize={50 * 1024 * 1024}
                onUploadComplete={handleUploadComplete}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File preview modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card relative max-h-[80vh] w-full max-w-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b p-4" style={{ borderColor: 'var(--color-border)' }}>
                <p className="truncate text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {previewFile.originalName}
                </p>
                <div className="flex items-center gap-2">
                  <a href={previewFile.url} download target="_blank" rel="noreferrer" className="btn btn-ghost text-xs gap-1">
                    <Download size={14} /> Download
                  </a>
                   <button onClick={() => setPreviewFile(null)} className="rounded p-1" style={{ color: 'var(--color-muted)' }} aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center p-8" style={{ minHeight: '300px' }}>
                {previewFile.mimeType?.startsWith('image/') ? (
                  <img src={previewFile.url} alt={previewFile.originalName} className="max-h-[60vh] max-w-full rounded-lg object-contain" />
                ) : previewFile.mimeType?.includes('pdf') ? (
                  <iframe src={previewFile.url} className="h-[60vh] w-full rounded-lg border" style={{ borderColor: 'var(--color-border)' }} title={previewFile.originalName} />
                ) : previewFile.mimeType?.startsWith('video/') ? (
                  <video src={previewFile.url} controls className="max-h-[60vh] max-w-full rounded-lg" />
                ) : previewFile.mimeType?.startsWith('audio/') ? (
                  <audio src={previewFile.url} controls className="w-full" />
                ) : (
                  <div className="text-center">
                    <File size={48} style={{ color: 'var(--color-muted)' }} className="mx-auto mb-4" />
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Preview not available for this file type</p>
                    <a href={previewFile.url} download target="_blank" rel="noreferrer" className="btn btn-primary mt-4 gap-1.5">
                      <Download size={14} /> Download File
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={searchQuery ? Search : FolderOpen}
          title={searchQuery ? 'No matching files' : 'No files yet'}
          description={
            searchQuery
              ? 'Nothing matches your search. Try different terms or widen the net.'
              : 'Your file hub is ready. Bring in the first asset and give your workspace a memory.'
          }
          steps={
            searchQuery
              ? ['Check the spelling of your search terms', 'Try a broader keyword', 'Clear the search filter']
              : ['Click Upload Files and pick what to bring in', 'Files appear instantly in this grid', 'Preview or download them any time']
          }
          action={searchQuery ? undefined : { label: 'Upload Files', onClick: () => setShowUploadModal(true) }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => {
            const Icon = getFileIconComponent(file.mimeType);
            const isImage = file.mimeType?.startsWith('image/');
            return (
              <motion.div
                key={file._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card group cursor-pointer overflow-hidden transition-all hover:shadow-md"
                onClick={() => setPreviewFile(file)}
              >
                {isImage ? (
                  <div className="relative h-36 overflow-hidden" style={{ background: 'var(--color-surface-active)' }}>
                    <img src={file.url} alt={file.originalName} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  </div>
                ) : (
                  <div className="flex h-36 items-center justify-center" style={{ background: 'var(--color-surface-active)' }}>
                    <Icon size={40} style={{ color: 'var(--color-muted)' }} />
                  </div>
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    {file.originalName}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {formatDate(file.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                     <button
                       onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                       className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-active)]"
                       style={{ color: 'var(--color-muted)' }}
                       aria-label="Preview file"
                     >
                       <Eye size={14} />
                     </button>
                    <a
                      href={file.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-active)]"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <Download size={14} />
                    </a>
                     {file.isArchived ? (
                       <button
                         onClick={(e) => { e.stopPropagation(); handleRestore(file._id); }}
                         className="rounded p-1.5 transition-colors hover:bg-[color:var(--color-success-ghost)]"
                         style={{ color: 'var(--color-success)' }}
                         aria-label="Restore file"
                       >
                         <RotateCcw size={14} />
                       </button>
                     ) : (
                       <button
                         onClick={(e) => { e.stopPropagation(); handleArchive(file._id); }}
                         className="rounded p-1.5 transition-colors hover:bg-[color:var(--color-warning-ghost)]"
                         style={{ color: 'var(--color-warning)' }}
                         aria-label="Archive file"
                       >
                         <Archive size={14} />
                       </button>
                     )}
                     <button
                       onClick={(e) => { e.stopPropagation(); handleDelete(file._id); }}
                       className="rounded p-1.5 transition-colors hover:bg-[var(--color-danger-light)]"
                       style={{ color: 'var(--color-danger)' }}
                       aria-label="Delete file"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b px-4 py-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          {files.map((file) => {
            const Icon = getFileIconComponent(file.mimeType);
            return (
              <div
                key={file._id}
                className="flex items-center border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--color-surface-hover)]"
                style={{ borderColor: 'var(--color-border-light)' }}
              >
                <div className="col-span-5 flex min-w-0 items-center gap-3">
                  {file.mimeType?.startsWith('image/') ? (
                    <img src={file.url} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--color-surface-active)', color: 'var(--color-muted)' }}>
                      <Icon size={14} />
                    </div>
                  )}
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="truncate text-sm font-medium text-left hover:underline"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    {file.originalName}
                  </button>
                </div>
                <div className="col-span-2 text-xs" style={{ color: 'var(--color-muted)' }}>{formatFileSize(file.size)}</div>
                <div className="col-span-2 text-xs" style={{ color: 'var(--color-muted)' }}>{file.mimeType?.split('/')[1] || file.mimeType}</div>
                <div className="col-span-2 text-xs" style={{ color: 'var(--color-muted)' }}>{formatDate(file.createdAt)}</div>
                <div className="col-span-1 flex gap-1">
                  <a href={file.url} download target="_blank" rel="noreferrer" className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-active)]" style={{ color: 'var(--color-muted)' }}>
                    <Download size={14} />
                  </a>
                   <button
                     onClick={() => setPreviewFile(file)}
                     className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-active)]"
                     style={{ color: 'var(--color-muted)' }}
                     aria-label="Preview file"
                   >
                     <Eye size={14} />
                   </button>
                   <button
                     onClick={() => handleDelete(file._id)}
                     className="rounded p-1.5 transition-colors hover:bg-[var(--color-danger-light)]"
                     style={{ color: 'var(--color-danger)' }}
                     aria-label="Delete file"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
