import mongoose, { Document, Schema } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  // If targetType is global, targetId is omitted.
  targetType: 'global' | 'organization' | 'team' | 'user';
  targetId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema(
  {
    key: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    isEnabled: { type: Boolean, default: false },
    targetType: { type: String, enum: ['global', 'organization', 'team', 'user'], default: 'global' },
    targetId: { type: String }, // e.g. organizationId, teamId, userId
  },
  { timestamps: true }
);

// A specific flag key can have one global state, but multiple overrides
FeatureFlagSchema.index({ key: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);
