import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminSession extends Document {
  adminId: mongoose.Types.ObjectId;
  tokenHash: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  expiresAt: Date;
  lastActive: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSessionSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    deviceFingerprint: { type: String },
    expiresAt: { type: Date, required: true },
    lastActive: { type: Date, default: Date.now },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired sessions
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);
