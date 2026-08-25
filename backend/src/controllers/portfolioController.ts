import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Portfolio from '../models/Portfolio';
import { cache, CACHE_KEYS } from '../utils/cache';
import { getIO } from '../sockets/socketManager';

export const getPortfolios = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

  const cacheKey = `portfolios:${workspaceId}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cached = await cache.get<any>(cacheKey);
  if (cached) return res.json(cached);

  const portfolios = await Portfolio.find({ workspaceId })
    .populate('ownerId', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  await cache.set(cacheKey, portfolios, 300);
  res.json(portfolios);
};

export const createPortfolio = async (req: AuthRequest, res: Response) => {
  const { name, description, workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

  const portfolio = await Portfolio.create({
    name,
    description,
    workspaceId,
    ownerId: req.user._id,
  });

  await cache.invalidatePattern(`portfolios:${workspaceId}`);
  getIO().to(`workspace_${workspaceId}`).emit('portfolio_created', portfolio);
  res.status(201).json(portfolio);
};

export const updatePortfolio = async (req: AuthRequest, res: Response) => {
  const portfolio = await Portfolio.findById(req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const updated = await Portfolio.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  await cache.invalidatePattern(`portfolios:${portfolio.workspaceId}`);
  getIO().to(`workspace_${portfolio.workspaceId}`).emit('portfolio_updated', updated);
  res.json(updated);
};

export const deletePortfolio = async (req: AuthRequest, res: Response) => {
  const portfolio = await Portfolio.findById(req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  await portfolio.deleteOne();
  await cache.invalidatePattern(`portfolios:${portfolio.workspaceId}`);
  getIO().to(`workspace_${portfolio.workspaceId}`).emit('portfolio_deleted', { portfolioId: portfolio._id });
  res.json({ message: 'Portfolio removed' });
};
