import Redis from 'ioredis';
import logger from '../utils/logger';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: () => null, // Disable auto-reconnect to stop spamming
});

redis.on('connect', () => {
  logger.info(`Redis connected successfully at ${redisUrl}`);
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});
