import mongoose, { Schema, Document } from 'mongoose';
import { WorkflowTrigger, WorkflowAction, WorkflowCondition } from '../index';

export interface IAutomationWorkflow extends Document {
  name: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  trigger: WorkflowTrigger;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  lastRunAt?: Date;
  runCount: number;
  tags: string[];
}

const AutomationWorkflowSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trigger: {
      type: { type: String, required: true },
      config: { type: Schema.Types.Mixed, default: {} },
    },
    conditions: [
      {
        field: { type: String, required: true },
        operator: {
          type: String,
          enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'exists'],
          required: true,
        },
        value: { type: Schema.Types.Mixed },
      },
    ],
    actions: [
      {
        type: { type: String, required: true },
        config: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    isActive: { type: Boolean, default: true },
    lastRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

AutomationWorkflowSchema.index({ workspaceId: 1, isActive: 1 });
AutomationWorkflowSchema.index({ 'trigger.type': 1, isActive: 1 });

export default mongoose.model<IAutomationWorkflow>('AutomationWorkflow', AutomationWorkflowSchema);
