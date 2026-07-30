import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingActionItem extends Document {
  meetingId: mongoose.Types.ObjectId;
  text: string;
  assigneeId?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled';
  dueDate?: Date;
  taskId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingActionItemSchema: Schema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    text: { type: String, required: true, trim: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    dueDate: { type: Date },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  },
  { timestamps: true }
);

MeetingActionItemSchema.index({ meetingId: 1 });
MeetingActionItemSchema.index({ assigneeId: 1 });

export default mongoose.model<IMeetingActionItem>('MeetingActionItem', MeetingActionItemSchema);
