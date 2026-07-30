import mongoose, { Schema, Document } from 'mongoose';

export interface ITamadMeetRoom extends Document {
  meetingId: mongoose.Types.ObjectId;
  roomId: string;
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  maxParticipants: number;
  meetingCode: string;
  inviteUrl?: string;
}

const TamadMeetRoomSchema = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'TamadMeetMeeting', required: true },
  roomId: { type: String, required: true, unique: true },
  isLocked: { type: Boolean, default: false },
  waitingRoomEnabled: { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 50 },
  meetingCode: { type: String, unique: true },
  inviteUrl: { type: String }
}, { timestamps: true });

export default mongoose.models.TamadMeetRoom || mongoose.model<ITamadMeetRoom>('TamadMeetRoom', TamadMeetRoomSchema);
