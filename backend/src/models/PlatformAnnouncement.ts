import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformAnnouncement extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'release';
  targetType: 'all' | 'organization' | 'team' | 'users';
  targetIds?: string[];
  scheduledFor?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformAnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'alert', 'release'], default: 'info' },
    targetType: { type: String, enum: ['all', 'organization', 'team', 'users'], default: 'all' },
    targetIds: [{ type: String }],
    scheduledFor: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlatformAnnouncement>('PlatformAnnouncement', PlatformAnnouncementSchema);
