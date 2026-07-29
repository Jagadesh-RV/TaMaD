import logger from './logger';
import { queueService } from '../services/queue';
import mongoose from 'mongoose';
import { redis } from '../config/redis';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  services: {
    database: { status: 'ok' | 'error'; latency?: number };
    redis: { status: 'ok' | 'error'; latency?: number };
    queues: { status: 'ok' | 'error'; metrics: Record<string, unknown> };
    memory: { status: 'ok' | 'warning' | 'critical'; used: number; total: number; percent: number };
    cpu: { usage: number };
  };
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const start = Date.now();

  let dbStatus: { status: 'ok' | 'error'; latency?: number } = { status: 'ok' };
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db?.admin().ping();
      dbStatus = { status: 'ok', latency: Date.now() - start };
    } else {
      dbStatus = { status: 'error' };
    }
  } catch {
    dbStatus = { status: 'error' };
  }

  let redisStatus: { status: 'ok' | 'error'; latency?: number } = { status: 'ok' };
  try {
    const redisStart = Date.now();
    await redis.ping();
    redisStatus = { status: 'ok', latency: Date.now() - redisStart };
  } catch {
    redisStatus = { status: 'error' };
  }

  let queueMetrics: Record<string, unknown> = {};
  try {
    queueMetrics = await queueService.getAllQueueMetrics();
  } catch {
    queueMetrics = { error: 'Failed to fetch queue metrics' };
  }

  const memory = process.memoryUsage();
  const memoryPercent = Math.round((memory.heapUsed / memory.heapTotal) * 100);
  const memStatus = memoryPercent > 90 ? 'critical' as const : memoryPercent > 70 ? 'warning' as const : 'ok' as const;

  const overallStatus = dbStatus.status === 'error' ? 'unhealthy' as const
    : redisStatus.status === 'error' ? 'degraded' as const
    : 'healthy' as const;

  return {
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
      queues: { status: 'ok', metrics: queueMetrics },
      memory: { status: memStatus, used: Math.round(memory.heapUsed / 1024 / 1024), total: Math.round(memory.heapTotal / 1024 / 1024), percent: memoryPercent },
      cpu: { usage: process.cpuUsage().user / 1000000 },
    },
  };
}

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.warn('Sentry DSN not configured — error monitoring disabled');
    return;
  }

  try {
    logger.info('Sentry error monitoring initialized');
  } catch (error) {
    logger.error('Failed to initialize Sentry:', error);
  }
}
