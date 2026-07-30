import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingAttendance extends Document {
  meetingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  joinTime: Date;
  leaveTime?: Date;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingAttendanceSchema: Schema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinTime: { type: Date, required: true },
    leaveTime: { type: Date },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

MeetingAttendanceSchema.index({ meetingId: 1, userId: 1 });

export default mongoose.model<IMeetingAttendance>('MeetingAttendance', MeetingAttendanceSchema);
