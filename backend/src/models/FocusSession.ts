import mongoose, { Schema, Document } from 'mongoose';

export interface IFocusSession extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  preset: string;
  durationMinutes: number;
  completed: boolean;
  startedAt: Date;
  endedAt?: Date;
}

const FocusSessionSchema: Schema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    preset: { type: String, default: 'Pomodoro' },
    durationMinutes: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

FocusSessionSchema.index({ workspaceId: 1, startedAt: -1 });
FocusSessionSchema.index({ userId: 1, startedAt: -1 });

export default mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);
