import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  taskType: 'epic' | 'story' | 'task' | 'bug' | 'subtask';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  startDate?: Date;
  assignees: mongoose.Types.ObjectId[];
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  epicId?: mongoose.Types.ObjectId;
  sprintId?: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  parentTaskId?: mongoose.Types.ObjectId;
  subtasks: mongoose.Types.ObjectId[];
  dependencies: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  blocks: mongoose.Types.ObjectId[];
  order: number;
  storyPoints?: number;
  estimatedTime?: number;
  actualTime?: number;
  watchers: mongoose.Types.ObjectId[];
  votes: mongoose.Types.ObjectId[];
  attachments: mongoose.Types.ObjectId[];
  customFields?: Map<string, any>;
  isArchived: boolean;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    taskType: {
      type: String,
      enum: ['epic', 'story', 'task', 'bug', 'subtask'],
      default: 'task',
    },
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
    epicId: { type: Schema.Types.ObjectId, ref: 'Epic' },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint' },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    subtasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    blockedBy: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    blocks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    order: { type: Number, default: 0 },
    storyPoints: { type: Number },
    estimatedTime: { type: Number },
    actualTime: { type: Number, default: 0 },
    watchers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    votes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    attachments: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    customFields: { type: Map, of: Schema.Types.Mixed },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for drag and drop ordering by status
TaskSchema.index({ workspaceId: 1, status: 1, order: 1 });
// Indexes for efficient querying
TaskSchema.index({ workspaceId: 1, projectId: 1 });
TaskSchema.index({ workspaceId: 1, sprintId: 1 });
TaskSchema.index({ epicId: 1 });
TaskSchema.index({ assignees: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
