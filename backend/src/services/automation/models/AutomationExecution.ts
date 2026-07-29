import mongoose, { Schema, Document } from 'mongoose';

export interface ExecutedAction {
  type: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface IAutomationExecution extends Document {
  workflowId: mongoose.Types.ObjectId;
  trigger: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  actions: ExecutedAction[];
  retryCount: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

const AutomationExecutionSchema: Schema = new Schema(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: 'AutomationWorkflow', required: true, index: true },
    trigger: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    actions: [
      {
        type: { type: String, required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
        error: { type: String },
        startedAt: { type: Date },
        completedAt: { type: Date },
      },
    ],
    retryCount: { type: Number, default: 0 },
    error: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

AutomationExecutionSchema.index({ workflowId: 1, createdAt: -1 });
AutomationExecutionSchema.index({ status: 1 });

export default mongoose.model<IAutomationExecution>('AutomationExecution', AutomationExecutionSchema);
