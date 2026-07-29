import { aiService } from './index';
import { ProjectPlan } from './types';
import logger from '../../utils/logger';

export async function generateProjectPlan(request: string, workspaceContext?: string): Promise<ProjectPlan> {
  const contextBlock = workspaceContext
    ? `\nCurrent workspace context:\n${workspaceContext}`
    : '';

  const systemPrompt = `You are a project planning AI. Generate a comprehensive project plan based on the user's request.
Return ONLY valid JSON matching this schema:
{
  "name": "project name",
  "description": "project description",
  "milestones": [
    {"name": "milestone name", "description": "what this milestone entails", "dueDate": "ISO date or null"}
  ],
  "tasks": [
    {
      "title": "task title",
      "description": "task description",
      "priority": "low|medium|high|urgent",
      "milestone": "name of the milestone this task belongs to",
      "estimatedTime": "minutes or null"
    }
  ],
  "dependencies": [
    {"from": "task title", "to": "task title"}
  ],
  "risks": [
    {"description": "risk description", "severity": "low|medium|high", "mitigation": "how to mitigate"}
  ],
  "timeline": [
    {"phase": "phase name", "startDate": "ISO date", "endDate": "ISO date"}
  ]
}

Generate realistic dates starting from today. Include 3-5 milestones, 8-15 tasks, identify dependencies, and assess risks.`;

  try {
    const response = await aiService.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Create a project plan for: ${request}${contextBlock}`,
        },
      ],
      temperature: 0.2,
    });

    let plan: ProjectPlan;
    try {
      plan = JSON.parse(response.content);
    } catch {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse project plan as JSON');
      }
    }

    return {
      name: plan.name || request,
      description: plan.description || '',
      milestones: Array.isArray(plan.milestones) ? plan.milestones : [],
      tasks: Array.isArray(plan.tasks) ? plan.tasks : [],
      dependencies: Array.isArray(plan.dependencies) ? plan.dependencies : [],
      risks: Array.isArray(plan.risks) ? plan.risks : [],
      timeline: Array.isArray(plan.timeline) ? plan.timeline : [],
    };
  } catch (error) {
    logger.error('Project plan generation failed:', error);
    throw new Error('Failed to generate project plan. Please try again with a more specific request.');
  }
}
