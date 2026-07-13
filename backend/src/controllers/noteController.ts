import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Note from '../models/Note';

export const getNotes = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  const notes = await Note.find({ workspaceId }).sort({ isPinned: -1, updatedAt: -1 });
  res.json(notes);
};

export const createNote = async (req: AuthRequest, res: Response) => {
  const { title, content, color, workspaceId, isPinned } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  
  const note = await Note.create({
    title: title || 'New Note',
    content,
    color,
    workspaceId,
    isPinned: isPinned || false,
    createdBy: req.user._id,
  });
  res.status(201).json(note);
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  const note = await Note.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(note);
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  await note.deleteOne();
  res.json({ message: 'Note removed' });
};
