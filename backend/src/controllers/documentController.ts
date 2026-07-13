import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Document from '../models/Document';

export const getDocuments = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  const documents = await Document.find({ workspaceId, isArchived: false }).sort({ updatedAt: -1 });
  res.json(documents);
};

export const getDocumentById = async (req: AuthRequest, res: Response) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: 'Document not found' });
  res.json(document);
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  const { title, content, workspaceId, folderId, tags } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  
  const document = await Document.create({
    title: title || 'Untitled Document',
    content,
    workspaceId,
    folderId,
    tags: tags || [],
    createdBy: req.user._id,
  });
  res.status(201).json(document);
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
  const document = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(document);
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: 'Document not found' });
  await document.deleteOne();
  res.json({ message: 'Document removed' });
};
