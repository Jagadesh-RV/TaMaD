import { useState, useCallback } from 'react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage, auth } from '../services/firebase';

interface UploadProgress {
  [key: string]: number;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: UploadProgress;
  error: string | null;
  uploadFile: (file: File, path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  resetError: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, path: string): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: { uid: auth.currentUser?.uid || '' },
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(prev => ({ ...prev, [file.name]: pct }));
          },
          (err) => {
            setError(err.message);
            setUploading(false);
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setProgress(prev => ({ ...prev, [file.name]: 100 }));
            setUploading(false);
            resolve(url);
          }
        );
      });
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
      throw err;
    }
  }, []);

  const deleteFile = useCallback(async (path: string): Promise<void> => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
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
