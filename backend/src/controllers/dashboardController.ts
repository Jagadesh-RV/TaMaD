import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Dashboard from '../models/Dashboard';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';

const DEFAULT_WIDGETS = [
  { id: 'active-sprint', type: 'active-sprint', x: 0, y: 0, w: 2, h: 2, visible: true },
  { id: 'velocity', type: 'velocity', x: 2, y: 0, w: 2, h: 2, visible: true },
  { id: 'burndown', type: 'burndown', x: 0, y: 2, w: 2, h: 2, visible: true },
  { id: 'workload', type: 'workload', x: 2, y: 2, w: 2, h: 2, visible: true },
];

export const getDashboard = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required' });

  let dashboard = await Dashboard.findOne({ workspaceId, isDefault: true });

  if (!dashboard) {
    dashboard = await Dashboard.create({
      name: 'Default Team Dashboard',
      workspaceId,
      isDefault: true,
      layout: DEFAULT_WIDGETS,
      createdBy: req.user._id,
    });
  }

  res.json(dashboard);
};

export const updateDashboard = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { layout, name } = req.body;

  const dashboard = await Dashboard.findByIdAndUpdate(
    id,
    { layout, name },
    { new: true }
  );

  if (!dashboard) return res.status(404).json({ error: 'Dashboard not found' });

  res.json(dashboard);
};
