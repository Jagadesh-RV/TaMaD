import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Project from '../models/Project';
import Habit from '../models/Habit';
import Goal from '../models/Goal';

// @desc    Dashboard summary stats
// @route   GET /api/analytics/summary
// @access  Private
export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const [total, done, inProgress, todo, review, overdue, todayDue, projects, habits, goals] = await Promise.all([
      Task.countDocuments({ workspaceId }),
      Task.countDocuments({ workspaceId, status: 'done' }),
      Task.countDocuments({ workspaceId, status: 'in-progress' }),
      Task.countDocuments({ workspaceId, status: 'todo' }),
      Task.countDocuments({ workspaceId, status: 'review' }),
      Task.countDocuments({ workspaceId, status: { $ne: 'done' }, dueDate: { $lt: todayStart } }),
      Task.countDocuments({ workspaceId, dueDate: { $gte: todayStart, $lte: today } }),
      Project.countDocuments({ workspaceId }),
      Habit.countDocuments({ workspaceId }),
      Goal.countDocuments({ workspaceId }),
    ]);

    // Streak: consecutive days with completed tasks
    const completedTasks = await Task.find({ workspaceId, status: 'done', updatedAt: { $gte: new Date(Date.now() - 60 * 86400000) } })
      .select('updatedAt')
      .sort({ updatedAt: -1 });
    const uniqueDays = [...new Set(completedTasks.map(t => t.updatedAt.toISOString().split('T')[0]))];
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 0; i < uniqueDays.length; i++) {
      const d = new Date(uniqueDays[i]);
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
        streak++;
      } else break;
    }

    res.json({
      total, done, inProgress, todo, review, overdue, todayDue,
      projects, habits, goals,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      streak,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Completion trend (last N days)
// @route   GET /api/analytics/trend
// @access  Private
export const getTrend = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, days = '30' } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const numDays = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);
    startDate.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      workspaceId,
      updatedAt: { $gte: startDate },
    }).select('status updatedAt createdAt');

    // Group by date
    const completedMap: Record<string, number> = {};
    const createdMap: Record<string, number> = {};

    tasks.forEach(t => {
      const createdDate = t.createdAt.toISOString().split('T')[0];
      createdMap[createdDate] = (createdMap[createdDate] || 0) + 1;
      if (t.status === 'done') {
        const completedDate = t.updatedAt.toISOString().split('T')[0];
        completedMap[completedDate] = (completedMap[completedDate] || 0) + 1;
      }
    });

    // Fill gaps
    const trend = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      trend.push({
        date: key,
        completed: completedMap[key] || 0,
        created: createdMap[key] || 0,
      });
    }

    res.json({ trend });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Priority breakdown
// @route   GET /api/analytics/priority
// @access  Private
export const getPriorityBreakdown = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const result = await Task.aggregate([
      { $match: { workspaceId: (workspaceId as string) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ priority: result.map(r => ({ priority: r._id, count: r.count })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Productivity heatmap (last 365 days)
// @route   GET /api/analytics/heatmap
// @access  Private
export const getHeatmap = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);

    const result = await Task.aggregate([
      { $match: { workspaceId: (workspaceId as string), status: 'done', updatedAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ heatmap: result.map(r => ({ date: r._id, count: r.count })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Tag distribution
// @route   GET /api/analytics/tags
// @access  Private
export const getTagDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const result = await Task.aggregate([
      { $match: { workspaceId: (workspaceId as string) } },
      { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $lookup: { from: 'tags', localField: '_id', foreignField: '_id', as: 'tag' } },
      { $unwind: { path: '$tag', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$tag.name', 'Unknown'] }, color: { $ifNull: ['$tag.color', '#888'] }, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ tags: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Export tasks as CSV
// @route   GET /api/analytics/export/csv
// @access  Private
export const exportCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, from, to, status } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const filter: any = { workspaceId };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('tags', 'name')
      .sort({ createdAt: -1 });

    const headers = ['Title', 'Status', 'Priority', 'Due Date', 'Created', 'Updated', 'Description'];
    const rows = tasks.map(t => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
      t.createdAt ? new Date(t.createdAt).toISOString() : '',
      t.updatedAt ? new Date(t.updatedAt).toISOString() : '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tamad-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Weekly summary report
// @route   GET /api/analytics/weekly
// @access  Private
export const getWeeklyReport = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [created, completed, overdue, byPriority, dailyActivity] = await Promise.all([
      Task.countDocuments({ workspaceId, createdAt: { $gte: weekAgo } }),
      Task.countDocuments({ workspaceId, status: 'done', updatedAt: { $gte: weekAgo } }),
      Task.countDocuments({ workspaceId, status: { $ne: 'done' }, dueDate: { $gte: weekAgo, $lt: new Date() } }),
      Task.aggregate([
        { $match: { workspaceId: (workspaceId as string), createdAt: { $gte: weekAgo } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { workspaceId: (workspaceId as string), createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      period: '7 days',
      created,
      completed,
      overdue,
      completionRate: created > 0 ? Math.round((completed / created) * 100) : 0,
      byPriority: byPriority.map(p => ({ priority: p._id, count: p.count })),
      dailyActivity: dailyActivity.map(d => ({ date: d._id, count: d.count })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
