import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  startDate?: Date;
  assignees: mongoose.Types.ObjectId[];
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  parentTaskId?: mongoose.Types.ObjectId;
  dependencies: mongoose.Types.ObjectId[];
  order: number;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  isArchived: boolean;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: { type: Date },
    startDate: { type: Date },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    order: { type: Number, default: 0 },
    estimatedTime: { type: Number },
    actualTime: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for drag and drop ordering by status
TaskSchema.index({ workspaceId: 1, status: 1, order: 1 });
// Indexes for efficient querying
TaskSchema.index({ workspaceId: 1, projectId: 1 });
TaskSchema.index({ assignees: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
