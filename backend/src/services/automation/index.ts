import { Router } from 'express';
import AutomationWorkflow from './models/AutomationWorkflow';
import AutomationExecution from './models/AutomationExecution';
import logger from '../../utils/logger';

export type TriggerType =
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.deleted'
  | 'project.created'
  | 'project.completed'
  | 'goal.completed'
  | 'habit.completed'
  | 'document.uploaded'
  | 'schedule'
  | 'webhook';

export type ActionType =
  | 'create.task'
  | 'update.task'
  | 'send.notification'
  | 'send.email'
  | 'generate.ai.summary'
  | 'create.calendar.event'
  | 'call.webhook'
  | 'run.ai.action';

export interface WorkflowTrigger {
  type: TriggerType;
  config: Record<string, unknown>;
}

export interface WorkflowAction {
  type: ActionType;
  config: Record<string, unknown>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: unknown;
}

export { AutomationWorkflow, AutomationExecution };

export async function evaluateWorkflows(
  trigger: TriggerType,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const workflows = await AutomationWorkflow.find({
      'trigger.type': trigger,
      isActive: true,
    }).lean();

    logger.info(`Evaluating ${workflows.length} workflows for trigger ${trigger}`);

    for (const workflow of workflows) {
      const conditionsMet = evaluateConditions(
        (workflow as Record<string, unknown>).conditions as WorkflowCondition[] | undefined,
        payload
      );

      if (!conditionsMet) continue;

      const execution = await AutomationExecution.create({
        workflowId: (workflow as Record<string, unknown>)._id,
        trigger,
        payload,
        status: 'pending',
      });

      await executeWorkflowActions(
        execution._id.toString(),
        (workflow as Record<string, unknown>).actions as WorkflowAction[]
      );
    }
  } catch (error) {
    logger.error('Error evaluating workflows:', error);
  }
}

function evaluateConditions(
  conditions: WorkflowCondition[] | undefined,
  payload: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const value = getNestedValue(payload, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return true;
    }
  });
}

async function executeWorkflowActions(
  executionId: string,
  actions: WorkflowAction[]
): Promise<void> {
  for (const action of actions) {
    try {
      await executeAction(action);
      await AutomationExecution.findByIdAndUpdate(executionId, {
        $push: { actions: { type: action.type, status: 'completed', completedAt: new Date() } },
      });
    } catch (error) {
      logger.error(`Action ${action.type} failed:`, error);
      await AutomationExecution.findByIdAndUpdate(executionId, {
        $push: { actions: { type: action.type, status: 'failed', error: (error as Error).message, completedAt: new Date() } },
        status: 'failed',
      });
    }
  }

  await AutomationExecution.findByIdAndUpdate(executionId, {
    status: 'completed',
    completedAt: new Date(),
  });
}

async function executeAction(action: WorkflowAction): Promise<void> {
  switch (action.type) {
    case 'send.notification':
      break;
    case 'send.email':
      break;
    case 'call.webhook':
      if (action.config.url) {
        await fetch(action.config.url as string, {
          method: (action.config.method as string) || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(action.config.headers as Record<string, string> || {}),
          },
          body: JSON.stringify(action.config.body || {}),
        });
      }
      break;
    default:
      logger.debug(`Action ${action.type} execution not implemented`);
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);
}
