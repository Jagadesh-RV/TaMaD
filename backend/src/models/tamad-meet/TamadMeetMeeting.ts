import mongoose, { Schema, Document } from 'mongoose';

export interface ITamadMeetMeeting extends Document {
  title: string;
  description?: string;
  teamId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number; // expected duration in minutes
  meetingType: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  aiSummary?: string;
}

const TamadMeetMeetingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['scheduled', 'active', 'ended', 'cancelled'], default: 'scheduled' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 30 },
  meetingType: { type: String, default: 'Custom Meeting' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  aiSummary: { type: String }
}, { timestamps: true });

export default mongoose.models.TamadMeetMeeting || mongoose.model<ITamadMeetMeeting>('TamadMeetMeeting', TamadMeetMeetingSchema);
