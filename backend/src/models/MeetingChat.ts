import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingChat extends Document {
  meetingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  attachments?: string[];
  replyToId?: mongoose.Types.ObjectId;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingChatSchema: Schema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    replyToId: { type: Schema.Types.ObjectId, ref: 'MeetingChat' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MeetingChatSchema.index({ meetingId: 1, timestamp: 1 });

export default mongoose.model<IMeetingChat>('MeetingChat', MeetingChatSchema);
