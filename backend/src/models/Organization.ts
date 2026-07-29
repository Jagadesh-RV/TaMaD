import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  domain?: string;
  logoUrl?: string;
  ownerId: mongoose.Types.ObjectId;
  billing: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'past_due' | 'canceled';
  };
  members: Array<{
    userId: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member';
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String },
    logoUrl: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    billing: {
      plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'past_due', 'canceled'], default: 'active' },
    },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
