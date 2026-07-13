import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  name: string;
  description?: string;
  projectId: mongoose.Types.ObjectId;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  createdBy: mongoose.Types.ObjectId;
}

const MilestoneSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMilestone>('Milestone', MilestoneSchema);
