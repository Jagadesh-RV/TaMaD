import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingReaction extends Document {
  meetingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  emoji: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingReactionSchema: Schema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MeetingReactionSchema.index({ meetingId: 1 });

export default mongoose.model<IMeetingReaction>('MeetingReaction', MeetingReactionSchema);
