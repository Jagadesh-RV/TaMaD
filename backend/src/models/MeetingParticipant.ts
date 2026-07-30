import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingParticipant extends Document {
  meetingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'host' | 'moderator' | 'participant' | 'viewer';
  status: 'invited' | 'accepted' | 'declined' | 'maybe' | 'joined' | 'left';
  joinedAt?: Date;
  leftAt?: Date;
  invitedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingParticipantSchema: Schema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['host', 'moderator', 'participant', 'viewer'], default: 'participant' },
    status: { type: String, enum: ['invited', 'accepted', 'declined', 'maybe', 'joined', 'left'], default: 'invited' },
    joinedAt: { type: Date },
    leftAt: { type: Date },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

MeetingParticipantSchema.index({ meetingId: 1, userId: 1 }, { unique: true });
MeetingParticipantSchema.index({ meetingId: 1, status: 1 });

export default mongoose.model<IMeetingParticipant>('MeetingParticipant', MeetingParticipantSchema);
