import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { parseNaturalLanguageTask, generateEmbedding } from '../utils/ai';
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

    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
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
    
    if (!query) return res.status(400).json({ error: 'Query is required' });

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

    // Simple response generation based on query keywords
    let response = '';
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
      const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
      
      response = `Here's your workspace summary:

**Tasks:** ${tasks.length} total, ${completedTasks} completed, ${inProgressTasks} in progress
**Overdue:** ${overdueTasks} tasks need attention
**Projects:** ${projects.length} active projects
**Goals:** ${goals.length} goals with average progress of ${goals.length > 0 ? Math.round(goals.reduce((a, g) => a + (g.progress || 0), 0) / goals.length) : 0}%

${overdueTasks > 0 ? '⚠️ You have overdue tasks that need immediate attention.' : '✅ Great job! No overdue tasks.'}`;
    } else if (lowerQuery.includes('overdue')) {
      const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');
      if (overdueTasks.length === 0) {
        response = 'Great news! You have no overdue tasks. Keep up the good work! 🎉';
      } else {
        response = `You have ${overdueTasks.length} overdue task(s):

${overdueTasks.map(t => `- **${t.title}** (Priority: ${t.priority})`).join('\n')}

I recommend prioritizing these tasks to get back on track.`;
      }
    } else if (lowerQuery.includes('productivity') || lowerQuery.includes('tips')) {
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      
      response = `Based on your workspace data:

**Your Productivity Score:** ${completionRate}%
**Tasks Completed:** ${completedTasks}/${tasks.length}

**Tips for you:**
1. ${completionRate > 70 ? 'Great completion rate! Consider tackling more challenging tasks.' : 'Focus on completing smaller tasks first to build momentum.'}
2. ${tasks.filter(t => t.priority === 'urgent').length > 0 ? 'You have urgent tasks - prioritize these first.' : 'Consider setting priorities for your pending tasks.'}
3. ${habits.length > 0 ? `Keep up your ${habits.length} habit(s) - consistency is key!` : 'Consider adding habits to build productive routines.'}`;
    } else if (lowerQuery.includes('report') || lowerQuery.includes('weekly')) {
      response = `**Weekly Report:**

**Tasks Overview:**
- Created: ${tasks.length}
- Completed: ${tasks.filter(t => t.status === 'done').length}
- In Progress: ${tasks.filter(t => t.status === 'in-progress').length}

**Projects Status:**
${projects.map(p => `- ${p.name}: ${p.status}`).join('\n') || 'No active projects'}

**Goal Progress:**
${goals.map(g => `- ${g.title}: ${g.progress || 0}%`).join('\n') || 'No goals set'}

Keep up the great work! 💪`;
    } else {
      // Default response
      response = `I understand you're asking about: "${query}"

Based on your workspace, I can help you with:
- **Task Management:** View, create, or prioritize tasks
- **Project Insights:** Track project progress and status
- **Goal Tracking:** Monitor your goals and milestones
- **Habit Analytics:** Review your habit streaks and consistency
- **Productivity Reports:** Generate summaries and reports

Try asking me to "summarize my tasks" or "show overdue items" for specific insights!`;
    }

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
