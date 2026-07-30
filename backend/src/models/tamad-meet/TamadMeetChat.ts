import mongoose, { Schema, Document } from 'mongoose';

export interface ITamadMeetChat extends Document {
  meetingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  isSystemMessage: boolean;
  createdAt: Date;
}

const TamadMeetChatSchema = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'TamadMeetMeeting', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isSystemMessage: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.TamadMeetChat || mongoose.model<ITamadMeetChat>('TamadMeetChat', TamadMeetChatSchema);
