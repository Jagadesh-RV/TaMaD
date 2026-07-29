import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamInvitation extends Document {
  email?: string;
  teamId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  inviteType: 'email' | 'link';
  token: string;
  maxUses?: number;
  uses: number;
  expiresAt: Date;
}

const TeamInvitationSchema: Schema = new Schema(
  {
    email: { type: String, lowercase: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'revoked'], default: 'pending' },
    inviteType: { type: String, enum: ['email', 'link'], default: 'email' },
    token: { type: String, required: true, unique: true },
    maxUses: { type: Number },
    uses: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Allow one active email invitation per email per team
TeamInvitationSchema.index({ email: 1, teamId: 1, status: 1 });
TeamInvitationSchema.index({ token: 1 });

export default mongoose.model<ITeamInvitation>('TeamInvitation', TeamInvitationSchema);
