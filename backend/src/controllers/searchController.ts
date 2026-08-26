import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Project from '../models/Project';
import Note from '../models/Note';
import Document from '../models/Document';
import File from '../models/File';
import Habit from '../models/Habit';
import Goal from '../models/Goal';

interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'note' | 'document' | 'file' | 'habit' | 'goal';
  title: string;
  subtitle: string;
  href: string;
}

// @desc    Global search across all workspace entities
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req: AuthRequest, res: Response) => {
  try {
    const { q, workspaceId } = req.query;

    if (!q || !workspaceId) {
      return res.status(400).json({ error: 'Query (q) and workspaceId are required' });
    }

    const query = (q as string).trim();
    if (query.length < 1) {
      return res.json({ results: [] });
    }

    const textQuery = { $text: { $search: query } };

    const [tasks, projects, notes, documents, files, habits, goals] = await Promise.all([
      Task.find({ workspaceId, ...textQuery })
        .limit(5)
        .select('title status priority description'),
      Project.find({ workspaceId, ...textQuery })
        .limit(5)
        .select('name status description'),
      Note.find({ workspaceId, ...textQuery })
        .limit(5)
        .select('title content'),
      Document.find({ workspaceId, isArchived: false, ...textQuery })
        .limit(5)
        .select('title content'),
      File.find({ workspaceId, isArchived: false, ...textQuery })
        .limit(5)
        .select('originalName mimeType size'),
      Habit.find({ workspaceId, ...textQuery })
        .limit(5)
        .select('name frequency'),
      Goal.find({ workspaceId, ...textQuery })
        .limit(5)
        .select('title status description'),
    ]);

    const results: SearchResult[] = [];

    tasks.forEach(t => {
      results.push({
        id: t._id.toString(),
        type: 'task',
        title: t.title,
        subtitle: `${t.status} · ${t.priority}`,
        href: '/tasks',
      });
    });

    projects.forEach(p => {
      results.push({
        id: p._id.toString(),
        type: 'project',
        title: p.name,
        subtitle: `${p.status}${p.description ? ' · ' + p.description.slice(0, 40) : ''}`,
        href: '/projects',
      });
    });

    notes.forEach(n => {
      results.push({
        id: n._id.toString(),
        type: 'note',
        title: n.title,
        subtitle: n.content ? n.content.replace(/[#*_`]/g, '').slice(0, 60) : 'Note',
        href: '/notes',
      });
    });

    documents.forEach(d => {
      results.push({
        id: d._id.toString(),
        type: 'document',
        title: d.title,
        subtitle: d.content ? d.content.replace(/[#*_`]/g, '').slice(0, 60) : 'Document',
        href: '/documents',
      });
    });

    files.forEach(f => {
      results.push({
        id: f._id.toString(),
        type: 'file',
        title: f.originalName,
        subtitle: f.mimeType,
        href: '/files',
      });
    });

    habits.forEach(h => {
      results.push({
        id: h._id.toString(),
        type: 'habit',
        title: h.name,
        subtitle: h.frequency || 'Habit',
        href: '/planner',
      });
    });

    goals.forEach(g => {
      results.push({
        id: g._id.toString(),
        type: 'goal',
        title: g.title,
        subtitle: g.status || 'Goal',
        href: '/planner',
      });
    });

    res.json({ results });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
