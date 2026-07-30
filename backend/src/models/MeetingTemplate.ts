import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingTemplate extends Document {
  name: string;
  description?: string;
  agenda?: string;
  defaultMeetingType: string;
  defaultDuration: number;
  teamId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  isGlobal: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    agenda: { type: String },
    defaultMeetingType: { type: String, default: 'Custom Meeting' },
    defaultDuration: { type: Number, default: 30 },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    isGlobal: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

MeetingTemplateSchema.index({ teamId: 1 });

export default mongoose.model<IMeetingTemplate>('MeetingTemplate', MeetingTemplateSchema);
