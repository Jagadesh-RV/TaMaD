import { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, File, ImageIcon, FileText, CheckCircle2,
  AlertCircle, Loader2, Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { useFileUpload, formatFileSize } from '../hooks/useFileUpload';

interface FileItem {
  file: File;
  path: string;
  url?: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

interface FileUploadProps {
  path: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onUploadComplete?: (urls: string[]) => void;
  className?: string;
}

const ACCEPT_MAP: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: ['application/pdf', 'text/markdown', 'text/plain'],
  office: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  all: [],
};

export default function FileUpload({
  path,
  accept = 'all',
  multiple = false,
  maxSize = 50 * 1024 * 1024,
  maxFiles = 10,
  onUploadComplete,
  className,
}: FileUploadProps) {
  const { uploading, progress, error, uploadFile, resetError } = useFileUpload();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = ACCEPT_MAP[accept] || ACCEPT_MAP.all;
  const acceptString = acceptTypes.length > 0 ? acceptTypes.join(',') : undefined;

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) return `File too large (max ${formatFileSize(maxSize)})`;
    if (acceptTypes.length > 0 && !acceptTypes.includes(file.type)) return 'File type not supported';
    return null;
  };

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).slice(0, multiple ? maxFiles - files.length : 1);
    const items: FileItem[] = [];

    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        continue;
      }
      const timestamp = Date.now();
      items.push({
        file,
        path: `${path}/${timestamp}_${file.name}`,
        status: 'pending',
      });
    }

    if (items.length > 0) {
      setFiles(prev => [...prev, ...items].slice(0, maxFiles));
    }
  }, [files.length, maxFiles, multiple, path]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleUploadAll = async () => {
    const pending = files.filter(f => f.status === 'pending');
    if (pending.length === 0) return;

    const urls: string[] = [];

    for (const item of pending) {
      setFiles(prev => prev.map(f => f.path === item.path ? { ...f, status: 'uploading' } : f));
      try {
        const url = await uploadFile(item.file, item.path);
        urls.push(url);
        setFiles(prev => prev.map(f => f.path === item.path ? { ...f, status: 'done', url } : f));
      } catch {
        setFiles(prev => prev.map(f => f.path === item.path ? { ...f, status: 'error' } : f));
      }
    }

    if (urls.length > 0 && onUploadComplete) {
      onUploadComplete(urls);
    }
  };

  const removeFile = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path));
  };

  const getFileIconComponent = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon size={16} />;
    if (file.type === 'application/pdf') return <FileText size={16} />;
    return <File size={16} />;
  };

  return (
    <div className={clsx('w-full', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
          dragOver ? 'scale-[1.02]' : '',
        )}
        style={{
          background: dragOver ? 'var(--color-accent-light)' : 'var(--color-surface-hover)',
          borderColor: dragOver ? 'var(--color-accent)' : 'var(--color-border)',
          color: 'var(--color-muted)',
        }}
      >
        <Upload size={24} className="mb-3" style={{ color: dragOver ? 'var(--color-accent)' : 'var(--color-muted)' }} />
        <p className="mb-1 text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
          Drop files here or click to browse
        </p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Max {formatFileSize(maxSize)} per file {multiple ? `| Up to ${maxFiles} files` : ''}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {error && (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}
        >
          <AlertCircle size={14} />
          {error}
          <button onClick={resetError} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((item) => (
              <motion.div
                key={item.path}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--color-surface-active)', color: 'var(--color-muted)' }}
                >
                  {getFileIconComponent(item.file)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                    {item.file.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {formatFileSize(item.file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'uploading' && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
                  )}
                  {item.status === 'done' && <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />}
                  {item.status === 'error' && <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} />}
                  <button
                    onClick={() => removeFile(item.path)}
                    className="rounded p-1 transition-colors hover:bg-red-50"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}

            {files.some(f => f.status === 'pending') && (
              <button
                onClick={handleUploadAll}
                disabled={uploading}
                className="btn btn-primary w-full mt-2"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} file(s)`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
