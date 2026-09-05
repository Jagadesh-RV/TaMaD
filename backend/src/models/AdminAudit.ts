import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAudit extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const AdminAuditSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', required: true, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAdminAudit>('AdminAudit', AdminAuditSchema);
