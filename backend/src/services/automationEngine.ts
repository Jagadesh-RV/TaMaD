import mongoose from 'mongoose';
import AutomationRule, { IAutomationRule, TriggerEvent, Condition } from '../models/AutomationRule';
import Task, { ITask } from '../models/Task';
import Notification from '../models/Notification';
import { io } from '../sockets/socketManager';

class AutomationEngine {
  
  /**
   * Evaluates all active automation rules for a given event and executes actions if conditions are met.
   * This is designed to be fire-and-forget so it doesn't block the main API thread.
   */
  public async evaluateTaskEvent(workspaceId: mongoose.Types.ObjectId, event: TriggerEvent, task: ITask, previousTask?: ITask) {
    try {
      // Find all active rules for this workspace and event
      const rules = await AutomationRule.find({
        workspaceId,
        isActive: true,
        'trigger.event': event
      });

      if (!rules.length) return;

      for (const rule of rules) {
        const conditionsMet = this.evaluateConditions(rule.trigger.conditions, task, previousTask);
        if (conditionsMet) {
          await this.executeAction(rule, task);
        }
      }
    } catch (error) {
      console.error(`[AutomationEngine] Failed to evaluate event ${event} for task ${task._id}:`, error);
    }
  }

  private evaluateConditions(conditions: Condition[], task: any, previousTask?: any): boolean {
    if (!conditions || conditions.length === 0) return true; // No conditions = always run

    // ALL conditions must be true (AND logic)
    for (const condition of conditions) {
      const { field, operator, value } = condition;
      
      const currentValue = task[field];
      const prevValue = previousTask ? previousTask[field] : undefined;

      // Special case: if this is a "CHANGED" event, the condition might apply to the delta
      // For now, we just evaluate the current state of the task against the condition.
      
      let conditionPassed = false;
      
      switch (operator) {
        case 'equals':
          conditionPassed = String(currentValue) === String(value);
          break;
        case 'not_equals':
          conditionPassed = String(currentValue) !== String(value);
          break;
        case 'contains':
          conditionPassed = String(currentValue).includes(String(value));
          break;
        case 'greater_than':
          conditionPassed = Number(currentValue) > Number(value);
          break;
        case 'less_than':
          conditionPassed = Number(currentValue) < Number(value);
          break;
        default:
          conditionPassed = false;
      }

      if (!conditionPassed) {
        return false;
      }
    }

    return true;
  }

  private async executeAction(rule: IAutomationRule, task: ITask) {
    const { type, payload } = rule.action;
    
    try {
      switch (type) {
        case 'SEND_NOTIFICATION':
          await this.sendNotification(rule.workspaceId, task, payload);
          break;
        case 'UPDATE_TASK':
          await this.updateTask(task, payload);
          break;
        case 'AUTO_ASSIGN':
          await this.autoAssign(task, payload);
          break;
        default:
          console.warn(`[AutomationEngine] Unknown action type: ${type}`);
      }
      console.log(`[AutomationEngine] Executed rule "${rule.name}" for task ${task._id}`);
    } catch (error) {
      console.error(`[AutomationEngine] Failed to execute action for rule "${rule.name}":`, error);
    }
  }

  private async sendNotification(workspaceId: mongoose.Types.ObjectId, task: ITask, payload: Record<string, any>) {
    // Expected payload: { message: string, recipientId?: string }
    const message = payload.message || `Automated alert for task: ${task.title}`;
    
    // If recipient is specific, send to them. Otherwise, maybe send to workspace admins? 
    // For simplicity, if no recipient, we skip (or we could broadcast).
    if (payload.recipientId) {
      const notif = await Notification.create({
        userId: payload.recipientId,
        workspaceId: workspaceId,
        type: 'system',
        title: 'Automation Triggered',
        message: message,
        read: false,
        link: `/tasks/${task._id}`
      });

      // Emit via socket
      io.to(payload.recipientId.toString()).emit('new_notification', notif);
    }
  }

  private async updateTask(task: ITask, payload: Record<string, any>) {
    // Expected payload: { status: 'done', priority: 'high', etc }
    const updated = await Task.findByIdAndUpdate(
      task._id, 
      { $set: payload }, 
      { new: true }
    );
    if (updated) {
      io.to(`workspace_${task.workspaceId}`).emit('task_updated', updated);
    }
  }

  private async autoAssign(task: ITask, payload: Record<string, any>) {
    // Expected payload: { assigneeId: string }
    if (payload.assigneeId) {
      const updated = await Task.findByIdAndUpdate(
        task._id,
        { $addToSet: { assignees: payload.assigneeId } },
        { new: true }
      );
      if (updated) {
        io.to(`workspace_${task.workspaceId}`).emit('task_updated', updated);
        
        // Notify the newly assigned user
        const notif = await Notification.create({
          userId: payload.assigneeId,
          workspaceId: task.workspaceId,
          type: 'mention',
          title: 'Auto-Assigned',
          message: `You were automatically assigned to: ${task.title}`,
          read: false,
          link: `/tasks/${task._id}`
        });
        io.to(payload.assigneeId).emit('new_notification', notif);
      }
    }
  }
}

export const automationEngine = new AutomationEngine();
