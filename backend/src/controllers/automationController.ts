import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AutomationRule from '../models/AutomationRule';

// @desc    Get all automation rules for workspace
// @route   GET /api/automations?workspaceId=...
// @access  Private
export const getRules = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const rules = await AutomationRule.find({ workspaceId }).sort({ createdAt: -1 });
  res.json(rules);
};

// @desc    Create an automation rule
// @route   POST /api/automations
// @access  Private
export const createRule = async (req: AuthRequest, res: Response) => {
  const { workspaceId, name, description, trigger, action, isActive } = req.body;
  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const rule = await AutomationRule.create({
    workspaceId,
    name,
    description,
    trigger,
    action,
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json(rule);
};

// @desc    Update an automation rule
// @route   PUT /api/automations/:id
// @access  Private
export const updateRule = async (req: AuthRequest, res: Response) => {
  const rule = await AutomationRule.findById(req.params.id);
  
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  // Prevent changing workspace
  if (req.body.workspaceId && req.body.workspaceId !== rule.workspaceId.toString()) {
    delete req.body.workspaceId;
  }

  const updatedRule = await AutomationRule.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json(updatedRule);
};

// @desc    Delete an automation rule
// @route   DELETE /api/automations/:id
// @access  Private
export const deleteRule = async (req: AuthRequest, res: Response) => {
  const rule = await AutomationRule.findById(req.params.id);
  
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  await rule.deleteOne();
  res.json({ message: 'Rule removed' });
};
