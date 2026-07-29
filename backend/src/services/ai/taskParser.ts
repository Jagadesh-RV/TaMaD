import { aiService } from './index';
import { ParsedTask } from './types';
import logger from '../../utils/logger';

export async function parseTask(text: string): Promise<ParsedTask> {
  const systemPrompt = `You are a task parser. Extract structured task data from natural language.
Return ONLY valid JSON matching this schema:
{
  "title": "concise actionable title",
  "description": "additional context or empty string",
  "priority": "low" | "medium" | "high" | "urgent",
  "dueDate": "ISO 8601 date string or null if not mentioned",
  "tags": ["array of relevant tags (max 5)"],
  "estimatedTime": "number of minutes or null",
  "subtasks": [{"title": "subtask description"}]
}

Rules:
- Default priority to "medium" if not specified
- Parse relative dates (tomorrow = next day, next week = 7 days, etc.)
- Extract tags from context (e.g., "frontend", "design", "bug", "meeting")
- Estimate time in minutes if mentioned (e.g., "2 hours" = 120)
- Break down into subtasks if the text describes multiple steps`;

  try {
    const response = await aiService.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
    });

    let parsed: ParsedTask;
    try {
      parsed = JSON.parse(response.content);
    } catch {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    return {
      title: parsed.title || text,
      description: parsed.description || '',
      priority: ['low', 'medium', 'high', 'urgent'].includes(parsed.priority)
        ? parsed.priority
        : 'medium',
      dueDate: parsed.dueDate || undefined,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      estimatedTime: typeof parsed.estimatedTime === 'number' ? parsed.estimatedTime : undefined,
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
    };
  } catch (error) {
    logger.error('Task parsing failed:', error);
    return fallbackParse(text);
  }
}

function fallbackParse(text: string): ParsedTask {
  const priorityMatch = text.match(/\b(urgent|high|medium|low)\s+priority\b/i);
  const priority = priorityMatch
    ? (priorityMatch[1].toLowerCase() as ParsedTask['priority'])
    : 'medium';

  const dueMatch = text.match(
    /(?:due|by|before|deadline)\s*(?::\s*)?(.+?)(?:\.|,|$)/i
  );
  const dueDate = dueMatch ? parseRelativeDate(dueMatch[1].trim()) : undefined;

  const timeMatch = text.match(/(\d+)\s*(hour|hr|minute|min|h|m)s?\b/i);
  let estimatedTime: number | undefined;
  if (timeMatch) {
    const num = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    estimatedTime = unit.startsWith('h') ? num * 60 : num;
  }

  const tagList = extractTags(text);

  return {
    title: text.split(/\.|\n/)[0].trim().substring(0, 150),
    description: text,
    priority,
    dueDate,
    tags: tagList,
    estimatedTime,
    subtasks: [],
  };
}

function parseRelativeDate(text: string): string | undefined {
  const now = new Date();
  const lower = text.toLowerCase().trim();

  if (lower === 'today') return now.toISOString().split('T')[0];
  if (lower === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower === 'next week') {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }
  if (lower.startsWith('next ')) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIdx = dayNames.indexOf(lower.replace('next ', ''));
    if (dayIdx >= 0) {
      const d = new Date(now);
      const daysUntil = (dayIdx - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntil);
      return d.toISOString().split('T')[0];
    }
  }

  const dateMatch = text.match(
    /(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?/
  );
  if (dateMatch) {
    try {
      const d = new Date(
        dateMatch[3] ? parseInt(dateMatch[3], 10) : now.getFullYear(),
        parseInt(dateMatch[1], 10) - 1,
        parseInt(dateMatch[2], 10)
      );
      return d.toISOString().split('T')[0];
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function extractTags(text: string): string[] {
  const commonTags = [
    'bug',
    'feature',
    'frontend',
    'backend',
    'design',
    'urgent',
    'meeting',
    'documentation',
    'testing',
    'deployment',
    'api',
    'database',
    'security',
    'performance',
    'refactor',
    'research',
    'planning',
    'review',
  ];
  const lower = text.toLowerCase();
  return commonTags.filter((tag) => lower.includes(tag));
}
