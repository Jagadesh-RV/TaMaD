import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  sprintId?: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  agenda?: string;
  meetingType: string;
  provider: string;
  roomName: string;
  meetingUrl?: string;
  meetingToken?: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  timezone: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isRecurring: boolean;
  recurrenceRule?: string;
  attachments?: string[];
  recordingUrl?: string;
  transcript?: string;
  aiSummary?: string;
  meetingNotes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint' },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    agenda: { type: String },
    meetingType: { type: String, default: 'Custom Meeting' },
    provider: { type: String, default: 'LiveKit' },
    roomName: { type: String, required: true, unique: true },
    meetingUrl: { type: String },
    meetingToken: { type: String },
    status: { type: String, enum: ['scheduled', 'active', 'ended', 'cancelled'], default: 'scheduled' },
    timezone: { type: String, default: 'UTC' },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    isRecurring: { type: Boolean, default: false },
    recurrenceRule: { type: String },
    attachments: [{ type: String }],
    recordingUrl: { type: String },
    transcript: { type: String },
    aiSummary: { type: String },
    meetingNotes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

MeetingSchema.index({ teamId: 1, status: 1 });
MeetingSchema.index({ hostId: 1 });
MeetingSchema.index({ startTime: 1 });

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
