import { Router, Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import AutomationWorkflow from '../services/automation/models/AutomationWorkflow';
import AutomationExecution from '../services/automation/models/AutomationExecution';
import { evaluateWorkflows } from '../services/automation';
import logger from '../utils/logger';

const router = Router();
router.use(protect);

router.get('/workflows', async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;
    const filter: Record<string, unknown> = {};
    if (workspaceId) filter.workspaceId = workspaceId;
    const workflows = await AutomationWorkflow.find(filter).sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

router.post('/workflows', async (req: AuthRequest, res: Response) => {
  try {
    const workflow = await AutomationWorkflow.create({
      ...req.body,
      createdBy: req.user?._id,
    });
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

router.put('/workflows/:id', async (req: AuthRequest, res: Response) => {
  try {
    const workflow = await AutomationWorkflow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

router.delete('/workflows/:id', async (req: AuthRequest, res: Response) => {
  try {
    await AutomationWorkflow.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workflow deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

router.patch('/workflows/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const workflow = await AutomationWorkflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    workflow.isActive = !workflow.isActive;
    await workflow.save();
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle workflow' });
  }
});

router.get('/executions', async (req: AuthRequest, res: Response) => {
  try {
    const { workflowId, limit = '20' } = req.query;
    const filter: Record<string, unknown> = {};
    if (workflowId) filter.workflowId = workflowId;
    const executions = await AutomationExecution.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .populate('workflowId', 'name');
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

router.get('/executions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const execution = await AutomationExecution.findById(req.params.id).populate(
      'workflowId',
      'name trigger'
    );
    if (!execution) return res.status(404).json({ error: 'Execution not found' });
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch execution' });
  }
});

router.post('/executions/:id/retry', async (req: AuthRequest, res: Response) => {
  try {
    const execution = await AutomationExecution.findById(req.params.id);
    if (!execution) return res.status(404).json({ error: 'Execution not found' });
    execution.status = 'pending';
    execution.retryCount += 1;
    execution.error = undefined;
    await execution.save();
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retry execution' });
  }
});

router.get('/templates', async (_req: Request, res: Response) => {
  const templates = [
    {
      name: 'Task Reminder',
      description: 'Send notification when a task is overdue',
      trigger: { type: 'schedule' as const, config: { cron: '0 9 * * *' } },
      conditions: [{ field: 'status', operator: 'not_equals' as const, value: 'done' }],
      actions: [{ type: 'send.notification' as const, config: { title: 'Task Reminder', body: 'You have pending tasks' } }],
    },
    {
      name: 'Project Completion',
      description: 'Notify team when a project is completed',
      trigger: { type: 'project.completed' as const, config: {} },
      actions: [{ type: 'send.notification' as const, config: {} }, { type: 'generate.ai.summary' as const, config: {} }],
    },
    {
      name: 'Daily Standup Reminder',
      description: 'Send daily standup reminder to team',
      trigger: { type: 'schedule' as const, config: { cron: '0 9 * * 1-5' } },
      actions: [{ type: 'send.notification' as const, config: { title: 'Daily Standup', body: 'Time for daily standup!' } }],
    },
  ];
  res.json(templates);
});

export default router;
