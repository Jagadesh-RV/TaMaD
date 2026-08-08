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
  health: 'on-track' | 'at-risk' | 'off-track';
  risks: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    status: 'open' | 'mitigated' | 'closed';
  }>;
  dependencies: mongoose.Types.ObjectId[];
  agileSettings: {
    methodology: 'scrum' | 'kanban' | 'hybrid';
    sprintLengthDays: number;
  };
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
    health: {
      type: String,
      enum: ['on-track', 'at-risk', 'off-track'],
      default: 'on-track',
    },
    risks: [
      {
        description: { type: String, required: true },
        impact: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        probability: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        status: { type: String, enum: ['open', 'mitigated', 'closed'], default: 'open' },
      }
    ],
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    agileSettings: {
      methodology: { type: String, enum: ['scrum', 'kanban', 'hybrid'], default: 'scrum' },
      sprintLengthDays: { type: Number, default: 14 },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProjectSchema.index({ workspaceId: 1, name: 1 }, { unique: true });
ProjectSchema.index({ workspaceId: 1, status: 1 });
ProjectSchema.index({ 'members.userId': 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
