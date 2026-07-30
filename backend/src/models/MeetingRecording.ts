import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingRecording extends Document {
  meetingId: mongoose.Types.ObjectId;
  recordingUrl: string;
  duration?: number;
  sizeBytes?: number;
  recordedBy?: mongoose.Types.ObjectId;
  isReady: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingRecordingSchema: Schema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    recordingUrl: { type: String, required: true },
    duration: { type: Number },
    sizeBytes: { type: Number },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isReady: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MeetingRecordingSchema.index({ meetingId: 1 });

export default mongoose.model<IMeetingRecording>('MeetingRecording', MeetingRecordingSchema);
