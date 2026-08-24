import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { parseNaturalLanguageTask, generateEmbedding, askAssistant } from '../utils/ai';
import Task from '../models/Task';
import Project from '../models/Project';
import Note from '../models/Note';
import Habit from '../models/Habit';
import Goal from '../models/Goal';

// @desc    Parse natural language into a structured task
// @route   POST /api/ai/parse-task
// @access  Private
export const parseTask = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.length > 2000) {
      return res.status(400).json({ error: 'Text input is required and must be under 2000 characters' });
    }

    const taskData = await parseNaturalLanguageTask(text);
    res.json(taskData);
  } catch (error: any) {
    res.status(500).json({ error: 'AI parsing failed', details: error.message });
  }
};

// @desc    Chat with workspace context
// @route   POST /api/ai/chat
// @access  Private
export const chatWithWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { query, workspaceId } = req.body;
    
    if (!query || typeof query !== 'string' || query.length > 500) {
      return res.status(400).json({ error: 'Query is required and must be under 500 characters' });
    }

    // Fetch workspace context
    const [tasks, projects, notes, habits, goals] = await Promise.all([
      Task.find({ workspaceId }).limit(10).select('title status priority dueDate'),
      Project.find({ workspaceId }).limit(5).select('name status'),
      Note.find({ workspaceId }).limit(5).select('title content'),
      Habit.find({ workspaceId }).limit(5).select('name frequency completedDates'),
      Goal.find({ workspaceId }).limit(5).select('title status progress'),
    ]);

    // Build context string
    const context = `
Workspace Context:
- ${tasks.length} tasks (${tasks.filter(t => t.status === 'done').length} completed)
- ${projects.length} projects
- ${notes.length} notes
- ${habits.length} habits
- ${goals.length} goals

Recent Tasks: ${tasks.slice(0, 5).map(t => `${t.title} (${t.status})`).join(', ') || 'None'}
Projects: ${projects.map(p => `${p.name} (${p.status})`).join(', ') || 'None'}
Goals: ${goals.map(g => `${g.title} - ${g.progress}% complete`).join(', ') || 'None'}
    `.trim();

    const response = await askAssistant(query, context);

    res.json({ 
      message: response,
      context: {
        tasksCount: tasks.length,
        projectsCount: projects.length,
        notesCount: notes.length,
        habitsCount: habits.length,
        goalsCount: goals.length,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Chat feature failed', details: error.message });
  }
};

// @desc    Generate weekly summary
// @route   POST /api/ai/weekly-summary
// @access  Private
export const generateWeeklySummary = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.body;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [tasks, projects] = await Promise.all([
      Task.find({ 
        workspaceId, 
        updatedAt: { $gte: weekAgo } 
      }).select('title status priority updatedAt'),
      Project.find({ workspaceId }).select('name status'),
    ]);

    const completedTasks = tasks.filter(t => t.status === 'done');
    const newTasks = tasks.filter(t => new Date(t.createdAt) >= weekAgo);

    const summary = {
      period: `${weekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      tasksCompleted: completedTasks.length,
      tasksCreated: newTasks.length,
      totalTasks: tasks.length,
      projects: projects.map(p => ({ name: p.name, status: p.status })),
      highlights: completedTasks.slice(0, 5).map(t => t.title),
    };

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
};
