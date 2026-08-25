import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: 'Task' | 'Project' | 'Workspace';
  entityId: mongoose.Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['Task', 'Project', 'Workspace'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Optimize queries for finding recent activity in a workspace or for a specific entity
AuditLogSchema.index({ workspaceId: 1, createdAt: -1 });
AuditLogSchema.index({ entityId: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
