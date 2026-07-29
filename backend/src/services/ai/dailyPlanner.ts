import { aiService } from './index';
import { DailyPlan } from './types';
import { WorkspaceContext } from './types';
import logger from '../../utils/logger';

export async function generateDailyPlan(date: string, context: WorkspaceContext): Promise<DailyPlan> {
  const contextStr = `TASKS:
- Total: ${context.tasks.total} (completed: ${context.tasks.completed}, in-progress: ${context.tasks.inProgress})
- Overdue: ${context.tasks.overdue}
- Urgent: ${context.tasks.urgent}
- Recent: ${context.tasks.recent.map((t) => `${t.title} [${t.status}] p:${t.priority}${t.dueDate ? ` d:${new Date(t.dueDate).toLocaleDateString()}` : ''}`).join('\n  ')}

PROJECTS: ${context.projects.items.map((p) => `${p.name} (${p.status})`).join(', ')}
GOALS: ${context.goals.items.map((g) => `${g.title} ${g.progress}%`).join(', ')}
HABITS: ${context.habits.items.map((h) => `${h.name} (streak: ${h.streak})`).join(', ')}`;

  const systemPrompt = `You are a daily planning AI. Create a structured daily plan based on workspace context.
Date: ${date}

Return ONLY valid JSON matching this schema:
{
  "date": "${date}",
  "morningPlan": ["action item for morning routine"],
  "priorityTasks": [{"title": "task name", "reason": "why this task is prioritized"}],
  "focusSchedule": [{"startTime": "HH:MM", "endTime": "HH:MM", "task": "focus session task", "breakAfter": true}],
  "endOfDayReview": [{"questions": ["review question 1", "review question 2"]}],
  "tips": ["productivity tip 1"]
}

Include 3-5 priority tasks from the workspace data. Use 90-minute focus blocks with breaks.`;

  try {
    const response = await aiService.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a daily plan for ${date} based on:\n\n${contextStr}` },
      ],
      temperature: 0.3,
    });

    let plan: DailyPlan;
    try {
      plan = JSON.parse(response.content);
    } catch {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse daily plan as JSON');
      }
    }

    return {
      date: plan.date || date,
      morningPlan: Array.isArray(plan.morningPlan) ? plan.morningPlan : [],
      priorityTasks: Array.isArray(plan.priorityTasks) ? plan.priorityTasks : [],
      focusSchedule: Array.isArray(plan.focusSchedule) ? plan.focusSchedule : [],
      endOfDayReview: Array.isArray(plan.endOfDayReview) ? plan.endOfDayReview : [],
      tips: Array.isArray(plan.tips) ? plan.tips : [],
    };
  } catch (error) {
    logger.error('Daily plan generation failed:', error);
    return fallbackDailyPlan(date, context);
  }
}

function fallbackDailyPlan(date: string, context: WorkspaceContext): DailyPlan {
  const urgentTasks = context.tasks.recent.filter(
    (t) => t.priority === 'urgent' && t.status !== 'done'
  );
  const highTasks = context.tasks.recent.filter(
    (t) => t.priority === 'high' && t.status !== 'done'
  );
  const overdue = context.tasks.recent.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  );

  const priorityTasks = [
    ...urgentTasks.slice(0, 2).map((t) => ({ title: t.title, reason: 'Urgent priority task' })),
    ...overdue.slice(0, 2).map((t) => ({ title: t.title, reason: 'Overdue - needs immediate attention' })),
    ...highTasks.slice(0, 2).map((t) => ({ title: t.title, reason: 'High priority task' })),
  ].slice(0, 5);

  return {
    date,
    morningPlan: [
      'Review and triage new notifications',
      'Check today\'s calendar and deadlines',
      priorityTasks.length > 0
        ? `Start with highest priority: "${priorityTasks[0].title}"`
        : 'Plan your three main objectives for the day',
    ],
    priorityTasks,
    focusSchedule: [
      { startTime: '09:00', endTime: '10:30', task: 'Deep work block', breakAfter: true },
      { startTime: '10:45', endTime: '12:00', task: priorityTasks[0]?.title || 'Priority tasks', breakAfter: true },
      { startTime: '13:00', endTime: '14:30', task: priorityTasks[1]?.title || 'Continue priority work', breakAfter: true },
      { startTime: '14:45', endTime: '16:00', task: 'Review and planning', breakAfter: false },
    ],
    endOfDayReview: [
      { questions: ['What did I accomplish today?', 'What progress did I make on priority tasks?'] },
      { questions: ['What obstacles did I face?', 'How can I prepare for tomorrow?'] },
    ],
    tips: [
      'Use the Pomodoro technique for focused work sessions',
      'Keep your workspace organized to minimize distractions',
      'Review your goals weekly to stay aligned with priorities',
    ],
  };
}
