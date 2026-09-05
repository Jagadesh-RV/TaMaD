import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemHealthSnapshot extends Document {
  timestamp: Date;
  metrics: {
    mongodb: { status: 'healthy' | 'degraded' | 'down'; latencyMs: number };
    redis: { status: 'healthy' | 'degraded' | 'down'; latencyMs: number };
    api: { requestRatePerSec: number; errorRatePercent: number; avgLatencyMs: number };
    activeUsers: number;
    activeSessions: number;
    cpuUsagePercent?: number;
    memoryUsageMb?: number;
  };
}

const SystemHealthSnapshotSchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    metrics: {
      mongodb: {
        status: { type: String, enum: ['healthy', 'degraded', 'down'], required: true },
        latencyMs: { type: Number, required: true },
      },
      redis: {
        status: { type: String, enum: ['healthy', 'degraded', 'down'], required: true },
        latencyMs: { type: Number, required: true },
      },
      api: {
        requestRatePerSec: { type: Number, required: true },
        errorRatePercent: { type: Number, required: true },
        avgLatencyMs: { type: Number, required: true },
      },
      activeUsers: { type: Number, required: true },
      activeSessions: { type: Number, required: true },
      cpuUsagePercent: { type: Number },
      memoryUsageMb: { type: Number },
    },
  },
  { timestamps: false }
);

// TTL index to automatically purge snapshots older than 30 days
SystemHealthSnapshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<ISystemHealthSnapshot>('SystemHealthSnapshot', SystemHealthSnapshotSchema);
