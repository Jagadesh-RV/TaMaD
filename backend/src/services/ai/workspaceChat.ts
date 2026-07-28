import Task from '../../models/Task';
import Project from '../../models/Project';
import Note from '../../models/Note';
import Habit from '../../models/Habit';
import Goal from '../../models/Goal';
import Document from '../../models/Document';
import { aiService } from './index';
import { WorkspaceContext } from './types';
import logger from '../../utils/logger';

export async function buildWorkspaceContext(
  workspaceId: string,
  userId?: string
): Promise<WorkspaceContext> {
  const now = new Date();

  const [tasks, projects, goals, habits, notes, documents] = await Promise.all([
    Task.find({
      workspaceId,
      isArchived: false,
      ...(userId ? { assignees: userId } : {}),
    }).select('title status priority dueDate createdAt'),
    Project.find({ workspaceId, isArchived: false }).select('name status startDate endDate'),
    Goal.find({ workspaceId }).select('title status progress type'),
    Habit.find({ workspaceId }).select('name frequency streak completedDates'),
    Note.find({ workspaceId }).select('title createdAt').lean() as unknown as Array<{ title: string; createdAt: Date }>,
    Document.find({ workspaceId, isArchived: false }).select('title createdAt').lean() as unknown as Array<{ title: string; createdAt: Date }>,
  ]);

  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  );
  const completed = tasks.filter((t) => t.status === 'done');
  const inProgress = tasks.filter((t) => t.status === 'in-progress');
  const urgent = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');

  return {
    tasks: {
      total: tasks.length,
      completed: completed.length,
      inProgress: inProgress.length,
      overdue: overdue.length,
      urgent: urgent.length,
      recent: tasks
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
        })),
    },
    projects: {
      total: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      items: projects.map((p) => ({ name: p.name, status: p.status })),
    },
    goals: {
      total: goals.length,
      completed: goals.filter((g) => g.status === 'completed').length,
      items: goals.map((g) => ({
        title: g.title,
        progress: g.progress,
        status: g.status,
      })),
    },
    habits: {
      total: habits.length,
      active: habits.filter((h) => h.streak > 0).length,
      items: habits.map((h) => ({
        name: h.name,
        streak: h.streak,
        frequency: h.frequency,
      })),
    },
      notes: {
        total: notes.length,
        recent: (notes as Array<{ title: string; createdAt: Date }>)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map((n) => n.title),
      },
      documents: {
        total: documents.length,
        recent: (documents as Array<{ title: string; createdAt: Date }>)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map((d) => d.title),
      },
  };
}

export interface ChatRequest {
  query: string;
  workspaceId: string;
  userId?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export async function chatWithAI(req: ChatRequest): Promise<{
  message: string;
  context: WorkspaceContext;
  suggestedPrompts?: string[];
}> {
  const context = await buildWorkspaceContext(req.workspaceId, req.userId);

  const systemPrompt = `You are TaMaD AI, a helpful workspace assistant. You have access to the following workspace context:

TASKS: ${context.tasks.total} total (${context.tasks.completed} completed, ${context.tasks.inProgress} in progress, ${context.tasks.overdue} overdue, ${context.tasks.urgent} urgent)

Recent tasks:
${context.tasks.recent.slice(0, 5).map((t) => `- ${t.title} [${t.status}] priority:${t.priority}${t.dueDate ? ` due:${new Date(t.dueDate).toLocaleDateString()}` : ''}`).join('\n')}

PROJECTS: ${context.projects.total} total (${context.projects.active} active)
${context.projects.items.map((p) => `- ${p.name} (${p.status})`).join('\n')}

GOALS: ${context.goals.total} total (${context.goals.completed} completed)
${context.goals.items.map((g) => `- ${g.title}: ${g.progress}% [${g.status}]`).join('\n')}

HABITS: ${context.habits.total} total
${context.habits.items.map((h) => `- ${h.name}: streak ${h.streak} (${h.frequency})`).join('\n')}

NOTES: ${context.notes.total} total
Recent: ${context.notes.recent.join(', ') || 'None'}

DOCUMENTS: ${context.documents.total} total
Recent: ${context.documents.recent.join(', ') || 'None'}

Answer the user's question naturally using this context. Be specific, reference actual task/project/goal names. Provide actionable insights and suggestions. If they ask about creating something, confirm what you understood and outline the plan.

Keep responses concise but informative. Use bullet points where helpful.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...(req.history || []).map((m) =>
      m.role === 'user'
        ? ({ role: 'user' as const, content: m.content } as const)
        : ({ role: 'assistant' as const, content: m.content } as const)
    ),
    { role: 'user' as const, content: req.query },
  ];

  try {
    const response = await aiService.complete({ messages });

    const suggestedPrompts = generateSuggestedPrompts(context);

    return {
      message: response.content,
      context,
      suggestedPrompts,
    };
  } catch (error) {
    logger.error('AI chat error:', error);
    return {
      message: generateFallbackResponse(req.query, context),
      context,
      suggestedPrompts: generateSuggestedPrompts(context),
    };
  }
}

function generateFallbackResponse(query: string, context: WorkspaceContext): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('summarize') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
    return `Here's your workspace overview:

**Tasks:** ${context.tasks.total} total, ${context.tasks.completed} completed, ${context.tasks.inProgress} in progress
${context.tasks.overdue > 0 ? `⚠️ ${context.tasks.overdue} overdue tasks need attention\n` : ''}
${context.tasks.urgent > 0 ? `🔴 ${context.tasks.urgent} urgent tasks pending\n` : ''}

**Projects:** ${context.projects.active} active out of ${context.projects.total}
**Goals:** ${context.goals.completed}/${context.goals.total} completed (avg ${context.goals.items.length > 0 ? Math.round(context.goals.items.reduce((a, g) => a + g.progress, 0) / context.goals.items.length) : 0}% progress)
**Habits:** ${context.habits.active} active streaks out of ${context.habits.total}
**Notes:** ${context.notes.total} notes • **Documents:** ${context.documents.total} documents`;
  }

  if (lowerQuery.includes('overdue') || lowerQuery.includes('behind') || lowerQuery.includes('late')) {
    const overdueTasks = context.tasks.recent.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    );
    if (overdueTasks.length === 0) {
      return 'Great news! No overdue tasks. Keep up the momentum!';
    }
    return `You have ${overdueTasks.length} overdue task(s):\n\n${overdueTasks.map((t) => `- **${t.title}** (${t.priority} priority)`).join('\n')}\n\nConsider re-prioritizing or breaking these into smaller steps.`;
  }

  if (lowerQuery.includes('focus') || lowerQuery.includes('priority') || lowerQuery.includes('today')) {
    const urgentTasks = context.tasks.recent.filter((t) => t.priority === 'urgent' && t.status !== 'done');
    const highTasks = context.tasks.recent.filter((t) => t.priority === 'high' && t.status !== 'done');
    return `**Today's Focus Areas:**\n\n${urgentTasks.length > 0 ? `🔴 **Urgent (${urgentTasks.length}):**\n${urgentTasks.map((t) => `- ${t.title}${t.dueDate ? ` (due ${new Date(t.dueDate).toLocaleDateString()})` : ''}`).join('\n')}\n\n` : ''}${highTasks.length > 0 ? `🟡 **High Priority (${highTasks.length}):**\n${highTasks.map((t) => `- ${t.title}`).join('\n')}\n\n` : ''}**Tip:** Start with your most difficult task first thing in the morning.`;
  }

  return `I can help you manage your workspace with ${context.tasks.total} tasks, ${context.projects.total} projects, ${context.goals.total} goals, and ${context.habits.total} habits.

Try asking me to:
- "Summarize my workspace"
- "Show overdue tasks"
- "What should I focus on today?"
- "Create a project plan for marketing campaign"
- "Generate a daily plan"`;
}

function generateSuggestedPrompts(context: WorkspaceContext): string[] {
  const prompts = ['Summarize my workspace'];
  if (context.tasks.overdue > 0) prompts.push('Show my overdue tasks');
  if (context.tasks.urgent > 0) prompts.push('What should I focus on today?');
  if (context.projects.total > 0) prompts.push('Give me a project status update');
  if (context.goals.total > 0) prompts.push('How are my goals progressing?');
  prompts.push('Create a daily plan for tomorrow');
  prompts.push('Generate a weekly report');
  return prompts.slice(0, 6);
}
