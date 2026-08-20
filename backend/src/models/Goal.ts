import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  description?: string;
  type: 'personal' | 'professional' | 'health' | 'financial' | 'other';
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  targetDate: Date;
  progress: number; // 0-100
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  milestones: Array<{
    title: string;
    completed: boolean;
  }>;
}

const GoalSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['personal', 'professional', 'health', 'financial', 'other'],
      default: 'professional',
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
      default: 'not-started',
    },
    targetDate: { type: Date, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    milestones: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);
GoalSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IGoal>('Goal', GoalSchema);
