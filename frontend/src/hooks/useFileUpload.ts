import { useState, useCallback } from 'react';
import axios from 'axios';
import api from '../utils/api';

interface UploadProgress {
  [key: string]: number;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: UploadProgress;
  error: string | null;
  uploadFile: (file: File, workspaceId: string) => Promise<{ downloadUrl: string, storagePath: string }>;
  deleteFile: (fileId: string) => Promise<void>;
  resetError: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, workspaceId: string): Promise<{ downloadUrl: string, storagePath: string }> => {
    setUploading(true);
    setError(null);

    try {
      // 1. Get Signed URL from Backend
      const { data } = await api.post('/files/upload-url', {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        workspaceId,
      });

      const { uploadUrl, storagePath } = data;

      // 2. Upload directly to Firebase Storage using Signed URL
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(prev => ({ ...prev, [file.name]: pct }));
          }
        },
      });

      setProgress(prev => ({ ...prev, [file.name]: 100 }));
      setUploading(false);

      // Return both for the caller to store in DB
      // The public download URL can be inferred if the bucket is public, 
      // but for RBAC we usually need a download token. 
      // For now, we will construct the standard public URL that Firebase Storage uses.
      // E.g. https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media
      const bucketUrl = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'tamad-ce3c7.firebasestorage.app';
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketUrl}/o/${encodeURIComponent(storagePath)}?alt=media`;

      return { downloadUrl, storagePath };
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
      throw err;
    }
  }, []);

  const deleteFile = useCallback(async (fileId: string): Promise<void> => {
    try {
      await api.delete(`/files/${fileId}`);
    } catch (err: any) {
      setError(err.message || 'Delete failed');
      throw err;
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return { uploading, progress, error, uploadFile, deleteFile, resetError };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'pdf';
  if (type.includes('word') || type.includes('document')) return 'doc';
  if (type.includes('spreadsheet') || type.includes('excel')) return 'xls';
  if (type.includes('presentation') || type.includes('powerpoint')) return 'ppt';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'archive';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('markdown') || type.includes('md')) return 'md';
  return 'file';
};
