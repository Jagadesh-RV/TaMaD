import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingTranscript extends Document {
  meetingId: mongoose.Types.ObjectId;
  transcriptText: string;
  language: string;
  generatedBy?: 'system' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const MeetingTranscriptSchema: Schema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    transcriptText: { type: String, required: true },
    language: { type: String, default: 'en-US' },
    generatedBy: { type: String, enum: ['system', 'user'], default: 'system' },
  },
  { timestamps: true }
);

MeetingTranscriptSchema.index({ meetingId: 1 });

export default mongoose.model<IMeetingTranscript>('MeetingTranscript', MeetingTranscriptSchema);
