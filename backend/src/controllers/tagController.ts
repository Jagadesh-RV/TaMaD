import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Tag from '../models/Tag';
import { cache, CACHE_KEYS } from '../utils/cache';
import { getIO } from '../sockets/socketManager';

export const getTags = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

  const cacheKey = CACHE_KEYS.TAGS(workspaceId as string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cached = await cache.get<any>(cacheKey);
  if (cached) return res.json(cached);

  const tags = await Tag.find({ workspaceId })
    .populate('createdBy', 'name email avatarUrl')
    .sort({ name: 1 });

  await cache.set(cacheKey, tags, 300);
  res.json(tags);
};

export const createTag = async (req: AuthRequest, res: Response) => {
  const { name, color, workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

  const existingTag = await Tag.findOne({ name, workspaceId });
  if (existingTag) return res.status(400).json({ error: 'Tag already exists' });

  const tag = await Tag.create({
    name,
    color,
    workspaceId,
    createdBy: req.user._id,
  });

  await cache.invalidatePattern(CACHE_KEYS.TAGS(workspaceId));
  getIO().to(`workspace_${workspaceId}`).emit('tag_created', tag);
  res.status(201).json(tag);
};

export const updateTag = async (req: AuthRequest, res: Response) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) return res.status(404).json({ error: 'Tag not found' });

  const updated = await Tag.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  await cache.invalidatePattern(CACHE_KEYS.TAGS(tag.workspaceId.toString()));
  getIO().to(`workspace_${tag.workspaceId}`).emit('tag_updated', updated);
  res.json(updated);
};

export const deleteTag = async (req: AuthRequest, res: Response) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) return res.status(404).json({ error: 'Tag not found' });

  await tag.deleteOne();
  await cache.invalidatePattern(CACHE_KEYS.TAGS(tag.workspaceId.toString()));
  getIO().to(`workspace_${tag.workspaceId}`).emit('tag_deleted', { tagId: tag._id });
  res.json({ message: 'Tag removed' });
};
