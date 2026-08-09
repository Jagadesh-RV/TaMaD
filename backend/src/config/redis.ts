import Redis from 'ioredis';
import logger from '../utils/logger';
import { redactConnectionString } from '../utils/redact';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  enableOfflineQueue: false, // Fail fast when disconnected
  commandTimeout: 2000,      // Fail fast on slow commands
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
});

redis.on('connect', () => {
  logger.info(`Redis connected successfully at ${redactConnectionString(redisUrl)}`);
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});
