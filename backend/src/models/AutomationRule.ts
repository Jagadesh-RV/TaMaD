import mongoose, { Document, Schema } from 'mongoose';

export type TriggerEvent = 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_STATUS_CHANGED' | 'TASK_PRIORITY_CHANGED';
export type Operator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
export type ActionType = 'SEND_NOTIFICATION' | 'UPDATE_TASK' | 'AUTO_ASSIGN';

export interface Condition {
  field: string;
  operator: Operator;
  value: string;
}

export interface AutomationAction {
  type: ActionType;
  payload: Record<string, any>;
}

export interface IAutomationRule extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    event: TriggerEvent;
    conditions: Condition[];
  };
  action: AutomationAction;
  createdAt: Date;
  updatedAt: Date;
}

const conditionSchema = new Schema<Condition>({
  field: { type: String, required: true },
  operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'], required: true },
  value: { type: String, required: true }
}, { _id: false });

const actionSchema = new Schema<AutomationAction>({
  type: { type: String, enum: ['SEND_NOTIFICATION', 'UPDATE_TASK', 'AUTO_ASSIGN'], required: true },
  payload: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const automationRuleSchema = new Schema<IAutomationRule>({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  trigger: {
    event: { 
      type: String, 
      enum: ['TASK_CREATED', 'TASK_UPDATED', 'TASK_STATUS_CHANGED', 'TASK_PRIORITY_CHANGED'], 
      required: true 
    },
    conditions: [conditionSchema]
  },
  action: { type: actionSchema, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IAutomationRule>('AutomationRule', automationRuleSchema);
