import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai';
import { parseTask as parseTaskAI } from '../services/ai/taskParser';
import { chatWithAI, buildWorkspaceContext } from '../services/ai/workspaceChat';
import { generateProjectPlan } from '../services/ai/projectPlanner';
import { generateDailyPlan } from '../services/ai/dailyPlanner';
import { generateEmbedding } from '../utils/ai';
import Task from '../models/Task';
import Project from '../models/Project';
import Habit from '../models/Habit';
import Goal from '../models/Goal';
import Note from '../models/Note';
import DocumentModel from '../models/Document';
import CommentModel from '../models/Comment';
import logger from '../utils/logger';

export const parseTask = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const taskData = await parseTaskAI(text);
    res.json(taskData);
  } catch (error) {
    logger.error('AI task parsing failed:', error);
    res.status(500).json({ error: 'AI parsing failed', details: (error as Error).message });
  }
};

export const chatWithWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { query, workspaceId, history } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const result = await chatWithAI({
      query,
      workspaceId,
      userId: req.user?._id?.toString(),
      history,
    });

    res.json(result);
  } catch (error) {
    logger.error('AI chat failed:', error);
    res.status(500).json({ error: 'Chat feature failed', details: (error as Error).message });
  }
};

export const generateWeeklySummary = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [tasks, projects] = await Promise.all([
      Task.find({
        workspaceId,
        updatedAt: { $gte: weekAgo },
      }).select('title status priority dueDate createdAt'),
      Project.find({ workspaceId }).select('name status'),
    ]);

    const completedTasks = tasks.filter((t) => t.status === 'done');
    const newTasks = tasks.filter(
      (t) => new Date(t.createdAt) >= weekAgo
    );

    const summary = {
      period: `${weekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      tasksCompleted: completedTasks.length,
      tasksCreated: newTasks.length,
      totalTasks: tasks.length,
      projects: projects.map((p) => ({ name: p.name, status: p.status })),
      highlights: completedTasks.slice(0, 5).map((t) => t.title),
    };

    res.json(summary);
  } catch (error) {
    logger.error('Weekly summary generation failed:', error);
    res.status(500).json({ error: 'Failed to generate summary', details: (error as Error).message });
  }
};

export const generateProjectPlanHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { request, workspaceId } = req.body;
    if (!request) return res.status(400).json({ error: 'Project request description is required' });

    let workspaceContext: string | undefined;
    if (workspaceId) {
      const context = await buildWorkspaceContext(workspaceId, req.user?._id?.toString());
      workspaceContext = `Tasks: ${context.tasks.total}, Projects: ${context.projects.total}, Goals: ${context.goals.total}`;
    }

    const plan = await generateProjectPlan(request, workspaceContext);
    res.json(plan);
  } catch (error) {
    logger.error('Project plan generation failed:', error);
    res.status(500).json({ error: 'Failed to generate project plan', details: (error as Error).message });
  }
};

export const generateDailyPlanHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, date } = req.body;
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const targetDate = date || new Date().toISOString().split('T')[0];
    const context = await buildWorkspaceContext(workspaceId, req.user?._id?.toString());
    const plan = await generateDailyPlan(targetDate, context);

    res.json(plan);
  } catch (error) {
    logger.error('Daily plan generation failed:', error);
    res.status(500).json({ error: 'Failed to generate daily plan', details: (error as Error).message });
  }
};

export const generateEmbeddingHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const embedding = await generateEmbedding(text);
    res.json({ embedding });
  } catch (error) {
    logger.error('Embedding generation failed:', error);
    res.status(500).json({ error: 'Failed to generate embedding', details: (error as Error).message });
  }
};

export const searchWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { query, workspaceId } = req.body;
    if (!query || !workspaceId) {
      return res.status(400).json({ error: 'Query and workspaceId are required' });
    }

    const [tasks, projects, notes, documents, goals, habits, comments] = await Promise.all([
      Task.find({
        workspaceId,
        isArchived: false,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      }).select('title description status priority dueDate').limit(5),
      Project.find({
        workspaceId,
        isArchived: false,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      }).select('name description status').limit(5),
      Note.find({
        workspaceId,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
        ],
      }).select('title content').limit(5),
      DocumentModel.find({
        workspaceId,
        isArchived: false,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
        ],
      }).select('title content').limit(5),
      Goal.find({
        workspaceId,
        title: { $regex: query, $options: 'i' },
      }).select('title status progress').limit(5),
      Habit.find({
        workspaceId,
        name: { $regex: query, $options: 'i' },
      }).select('name streak frequency').limit(5),
      CommentModel.find({
        content: { $regex: query, $options: 'i' },
      }).select('content').limit(5),
    ]);

    res.json({
      tasks,
      projects,
      notes,
      documents,
      goals,
      habits,
      comments,
      total: tasks.length + projects.length + notes.length + documents.length + goals.length + habits.length + comments.length,
    });
  } catch (error) {
    logger.error('AI search failed:', error);
    res.status(500).json({ error: 'Search failed', details: (error as Error).message });
  }
};
