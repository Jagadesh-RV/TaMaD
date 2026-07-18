import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  portfolioId?: mongoose.Types.ObjectId;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  startDate?: Date;
  endDate?: Date;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    role: 'manager' | 'member' | 'viewer';
  }>;
  createdBy: mongoose.Types.ObjectId;
  isArchived: boolean;
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    portfolioId: { type: Schema.Types.ObjectId, ref: 'Portfolio' },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed'],
      default: 'planning',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['manager', 'member', 'viewer'], default: 'member' },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProjectSchema.index({ workspaceId: 1, status: 1 });
ProjectSchema.index({ 'members.userId': 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
