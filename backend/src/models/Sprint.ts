import mongoose, { Schema, Document } from 'mongoose';

export interface ISprint extends Document {
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed';
  projectId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const SprintSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    goal: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SprintSchema.index({ workspaceId: 1, projectId: 1 });
SprintSchema.index({ status: 1 });

export default mongoose.model<ISprint>('Sprint', SprintSchema);
