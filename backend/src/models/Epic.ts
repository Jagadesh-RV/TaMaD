import mongoose, { Schema, Document } from 'mongoose';

export interface IEpic extends Document {
  name: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  projectId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const EpicSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EpicSchema.index({ workspaceId: 1, projectId: 1 });

export default mongoose.model<IEpic>('Epic', EpicSchema);
