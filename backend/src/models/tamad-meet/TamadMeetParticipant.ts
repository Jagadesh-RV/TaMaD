import mongoose, { Schema, Document } from 'mongoose';

export interface ITamadMeetParticipant extends Document {
  meetingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  socketId?: string;
  role: 'host' | 'moderator' | 'participant' | 'viewer';
  status: 'invited' | 'accepted' | 'declined' | 'joined' | 'left' | 'waiting';
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  joinedAt?: Date;
  leftAt?: Date;
}

const TamadMeetParticipantSchema = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'TamadMeetMeeting', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  socketId: { type: String },
  role: { type: String, enum: ['host', 'moderator', 'participant', 'viewer'], default: 'participant' },
  status: { type: String, enum: ['invited', 'accepted', 'declined', 'joined', 'left', 'waiting'], default: 'invited' },
  isMuted: { type: Boolean, default: true },
  isVideoOn: { type: Boolean, default: false },
  isScreenSharing: { type: Boolean, default: false },
  handRaised: { type: Boolean, default: false },
  joinedAt: { type: Date },
  leftAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.TamadMeetParticipant || mongoose.model<ITamadMeetParticipant>('TamadMeetParticipant', TamadMeetParticipantSchema);
