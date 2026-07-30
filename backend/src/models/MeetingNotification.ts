import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingNotification extends Document {
  userId: mongoose.Types.ObjectId;
  meetingId: mongoose.Types.ObjectId;
  type: 'invite' | 'reminder' | 'updated' | 'cancelled' | 'recording_ready' | 'summary_ready' | 'action_items_ready';
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingNotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    type: { 
      type: String, 
      enum: ['invite', 'reminder', 'updated', 'cancelled', 'recording_ready', 'summary_ready', 'action_items_ready'],
      required: true 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MeetingNotificationSchema.index({ userId: 1, isRead: 1 });
MeetingNotificationSchema.index({ meetingId: 1 });

export default mongoose.model<IMeetingNotification>('MeetingNotification', MeetingNotificationSchema);
