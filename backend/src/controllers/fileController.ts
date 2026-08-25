import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import File from '../models/File';
import { getFirebaseStorage } from '../config/firebase';

// @desc    Get all files for workspace
// @route   GET /api/files
// @access  Private
export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, folder, search, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }

    const filter: any = { workspaceId, isArchived: false };
    if (folder) filter.folder = folder;
    if (search) {
      filter.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortDir === 'asc' ? 1 : -1;

    const files = await File.find(filter).sort(sort).populate('uploadedBy', 'name email');
    res.json(files);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single file
// @route   GET /api/files/:id
// @access  Private
export const getFileById = async (req: AuthRequest, res: Response) => {
  try {
    const file = await File.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create file metadata (called after client-side upload to Firebase Storage)
// @route   POST /api/files
// @access  Private
export const createFile = async (req: AuthRequest, res: Response) => {
  try {
    const { originalName, fileName, mimeType, size, url, storagePath, workspaceId, folder, taskId, noteId, projectId } = req.body;

    if (!originalName || !url || !workspaceId) {
      return res.status(400).json({ error: 'originalName, url, and workspaceId are required' });
    }

    const file = await File.create({
      originalName,
      fileName: fileName || originalName,
      mimeType: mimeType || 'application/octet-stream',
      size: size || 0,
      url,
      storagePath: storagePath || '',
      workspaceId,
      uploadedBy: req.user._id,
      folder: folder || '/',
      taskId,
      noteId,
      projectId,
    });

    res.status(201).json(file);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update file metadata
// @route   PUT /api/files/:id
// @access  Private
export const updateFile = async (req: AuthRequest, res: Response) => {
  try {
    const { originalName, folder } = req.body;
    const update: any = {};
    if (originalName) update.originalName = originalName;
    if (folder) update.folder = folder;

    const file = await File.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Archive file (soft delete)
// @route   PUT /api/files/:id/archive
// @access  Private
export const archiveFile = async (req: AuthRequest, res: Response) => {
  try {
    const file = await File.findByIdAndUpdate(
      req.params.id,
      { $set: { isArchived: true } },
      { new: true }
    );
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Restore archived file
// @route   PUT /api/files/:id/restore
// @access  Private
export const restoreFile = async (req: AuthRequest, res: Response) => {
  try {
    const file = await File.findByIdAndUpdate(
      req.params.id,
      { $set: { isArchived: false } },
      { new: true }
    );
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete file metadata and physical file
// @route   DELETE /api/files/:id
// @access  Private
export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    // Delete physical file from Firebase Storage
    if (file.storagePath) {
      try {
        const bucket = getFirebaseStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'tamad-ce3c7.firebasestorage.app');
        await bucket.file(file.storagePath).delete();
      } catch (err: any) {
        console.error('Failed to delete physical file from Firebase Storage:', err);
      }
    }
    
    res.json({ message: 'File deleted successfully' });
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get file stats for workspace
// @route   GET /api/files/stats
// @access  Private
export const getFileStats = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const [totalFiles, totalSize, typeBreakdown] = await Promise.all([
      File.countDocuments({ workspaceId, isArchived: false }),
      File.aggregate([
        { $match: { workspaceId, isArchived: false } },
        { $group: { _id: null, total: { $sum: '$size' } } },
      ]),
      File.aggregate([
        { $match: { workspaceId, isArchived: false } },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $regexMatch: { input: '$mimeType', regex: /^image\// } }, then: 'images' },
                  { case: { $regexMatch: { input: '$mimeType', regex: /pdf/ } }, then: 'pdfs' },
                  { case: { $regexMatch: { input: '$mimeType', regex: /video\// } }, then: 'videos' },
                  { case: { $regexMatch: { input: '$mimeType', regex: /audio\// } }, then: 'audio' },
                ],
                default: 'other',
              },
            },
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
          },
        },
      ]),
    ]);

    res.json({
      totalFiles,
      totalSize: totalSize[0]?.total || 0,
      byType: typeBreakdown,
    });
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc    Generate a signed URL for uploading a file
// @route   POST /api/files/upload-url
// @access  Private
export const generateUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, contentType, workspaceId } = req.body;
    
    if (!fileName || !workspaceId) {
      return res.status(400).json({ error: 'fileName and workspaceId are required' });
    }

    const bucket = getFirebaseStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'tamad-ce3c7.firebasestorage.app');
    
    const filePath = `workspaces/${workspaceId}/${Date.now()}_${fileName}`;
    const fileRef = bucket.file(filePath);
    
    const options: any = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
    
    if (contentType) {
      options.contentType = contentType;
    }

    const [url] = await fileRef.getSignedUrl(options);
    
    res.json({ uploadUrl: url, storagePath: filePath });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to generate upload URL: ' + error.message });
  }
};

// @desc    Generate a signed URL for downloading a file
// @route   GET /api/files/:id/download-url
// @access  Private
export const generateDownloadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    if (!file.storagePath) {
      return res.status(400).json({ error: 'File does not have a storage path' });
    }
    
    // We assume requireEntityWorkspaceMember has already validated access
    const bucket = getFirebaseStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'tamad-ce3c7.firebasestorage.app');
    const fileRef = bucket.file(file.storagePath);
    
    const [url] = await fileRef.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    
    res.json({ downloadUrl: url });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to generate download URL: ' + error.message });
  }
};
