import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamInvitation extends Document {
  email: string;
  workspaceId: mongoose.Types.ObjectId;
  role: string;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  token: string;
  expiresAt: Date;
}

const TeamInvitationSchema: Schema = new Schema(
  {
    email: { type: String, required: true, lowercase: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    role: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Allow one active invitation per email per workspace
TeamInvitationSchema.index({ email: 1, workspaceId: 1, status: 1 });
TeamInvitationSchema.index({ token: 1 });

export default mongoose.model<ITeamInvitation>('TeamInvitation', TeamInvitationSchema);
