import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'danger' | 'task_assigned' | 'task_updated' | 'mention' | 'comment' | 'reminder';
  entityId?: mongoose.Types.ObjectId;
  entityType?: 'task' | 'project' | 'note' | 'goal' | 'habit' | 'whiteboard' | 'document';
  read: boolean;
  link?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'danger', 'task_assigned', 'task_updated', 'mention', 'comment', 'reminder'],
      default: 'info',
    },
    entityId: { type: Schema.Types.ObjectId },
    entityType: {
      type: String,
      enum: ['task', 'project', 'note', 'goal', 'habit', 'whiteboard', 'document'],
    },
    read: { type: Boolean, default: false },
    link: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
