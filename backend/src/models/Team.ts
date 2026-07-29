import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  slug: string;
  organizationId?: mongoose.Types.ObjectId;
  description?: string;
  logoUrl?: string;
  color?: string;
  visibility: 'private' | 'public';
  timeZone: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    description: { type: String },
    logoUrl: { type: String },
    color: { type: String, default: '#2563eb' },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    timeZone: { type: String, default: 'UTC' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
TeamSchema.index({ slug: 1 });
TeamSchema.index({ createdBy: 1 });

export default mongoose.model<ITeam>('Team', TeamSchema);
