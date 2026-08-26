// @ts-nocheck
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FocusSession from '../models/FocusSession';

// @desc    Get focus sessions for workspace
// @route   GET /api/focus-sessions
// @access  Private
export const getFocusSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, limit = '50' } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const sessions = await FocusSession.find({ workspaceId, userId: req.user._id })
      .sort({ startedAt: -1 })
      .limit(parseInt(limit as string));

    res.json(sessions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a focus session
// @route   POST /api/focus-sessions
// @access  Private
export const createFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, preset, durationMinutes } = req.body;
    if (!workspaceId || !durationMinutes) {
      return res.status(400).json({ error: 'workspaceId and durationMinutes required' });
    }

    const session = await FocusSession.create({
      workspaceId,
      userId: req.user._id,
      preset: preset || 'Pomodoro',
      durationMinutes,
      completed: false,
      startedAt: new Date(),
    });

    res.status(201).json(session);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Complete a focus session
// @route   PUT /api/focus-sessions/:id/complete
// @access  Private
export const completeFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await FocusSession.findByIdAndUpdate(
      req.params.id,
      { $set: { completed: true, endedAt: new Date() } },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get focus stats
// @route   GET /api/focus-sessions/stats
// @access  Private
export const getFocusStats = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todaySessions, weekSessions, totalSessions] = await Promise.all([
      FocusSession.countDocuments({ workspaceId, userId: req.user._id, completed: true, startedAt: { $gte: today } }),
      FocusSession.aggregate([
        { $match: { workspaceId: (workspaceId as string), userId: req.user._id, completed: true, startedAt: { $gte: weekAgo } } },
        { $group: { _id: null, totalMinutes: { $sum: '$durationMinutes' }, count: { $sum: 1 } } },
      ]),
      FocusSession.countDocuments({ workspaceId, userId: req.user._id, completed: true }),
    ]);

    res.json({
      todaySessions,
      weekMinutes: weekSessions[0]?.totalMinutes || 0,
      weekSessions: weekSessions[0]?.count || 0,
      totalSessions,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
