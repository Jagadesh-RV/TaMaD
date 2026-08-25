import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Category from '../models/Category';
import { cache, CACHE_KEYS } from '../utils/cache';
import { getIO } from '../sockets/socketManager';

export const getCategories = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

  const cacheKey = CACHE_KEYS.CATEGORIES(workspaceId as string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cached = await cache.get<any>(cacheKey);
  if (cached) return res.json(cached);

  const categories = await Category.find({ workspaceId })
    .populate('createdBy', 'name email avatarUrl')
    .sort({ name: 1 });

  await cache.set(cacheKey, categories, 300);
  res.json(categories);
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, color, workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

  const existingCategory = await Category.findOne({ name, workspaceId });
  if (existingCategory) return res.status(400).json({ error: 'Category already exists' });

  const category = await Category.create({
    name,
    color,
    workspaceId,
    createdBy: req.user._id,
  });

  await cache.invalidatePattern(CACHE_KEYS.CATEGORIES(workspaceId));
  getIO().to(`workspace_${workspaceId}`).emit('category_created', category);
  res.status(201).json(category);
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const updated = await Category.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  await cache.invalidatePattern(CACHE_KEYS.CATEGORIES(category.workspaceId.toString()));
  getIO().to(`workspace_${category.workspaceId}`).emit('category_updated', updated);
  res.json(updated);
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  await category.deleteOne();
  await cache.invalidatePattern(CACHE_KEYS.CATEGORIES(category.workspaceId.toString()));
  getIO().to(`workspace_${category.workspaceId}`).emit('category_deleted', { categoryId: category._id });
  res.json({ message: 'Category removed' });
};
