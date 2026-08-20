import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number[]; // 0=Sun, 1=Mon... for custom
  color: string;
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  streak: number;
  longestStreak: number;
  completedDates: Date[]; // log of completion dates
}

const HabitSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
    targetDays: [{ type: Number }], // e.g., [1, 3, 5] for Mon, Wed, Fri
    color: { type: String, default: '#3b82f6' },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completedDates: [{ type: Date }],
  },
  { timestamps: true }
);
HabitSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IHabit>('Habit', HabitSchema);
