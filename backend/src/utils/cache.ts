import { redis } from '../config/redis';
import logger from './logger';

const DEFAULT_TTL = 300; // 5 minutes

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (_error) {
      logger.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (_error) {
      logger.warn(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (_error) {
      logger.warn(`Cache del error for key ${key}:`, error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }
    } catch (_error) {
      logger.warn(`Cache invalidatePattern error for pattern ${pattern}:`, error);
    }
  },

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_TTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  },
};

export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  WORKSPACE: (userId: string) => `workspace:${userId}`,
  TASKS: (workspaceId: string, params: string) => `tasks:${workspaceId}:${params}`,
  PROJECTS: (workspaceId: string) => `projects:${workspaceId}`,
  NOTES: (workspaceId: string) => `notes:${workspaceId}`,
  DOCUMENTS: (workspaceId: string) => `documents:${workspaceId}`,
  HABITS: (workspaceId: string) => `habits:${workspaceId}`,
  GOALS: (workspaceId: string) => `goals:${workspaceId}`,
  WHITEBOARDS: (workspaceId: string) => `whiteboards:${workspaceId}`,
  NOTIFICATIONS_UNREAD: (userId: string) => `notifications:unread:${userId}`,
  TAGS: (workspaceId: string) => `tags:${workspaceId}`,
  CATEGORIES: (workspaceId: string) => `categories:${workspaceId}`,
  PORTFOLIOS: (workspaceId: string) => `portfolios:${workspaceId}`,
};

export const CACHE_TTL = {
  USER: 300,        // 5 minutes
  WORKSPACE: 600,   // 10 minutes
  TASKS: 60,        // 1 minute
  PROJECTS: 300,    // 5 minutes
  NOTES: 120,       // 2 minutes
  DOCUMENTS: 120,   // 2 minutes
  HABITS: 120,      // 2 minutes
  GOALS: 120,       // 2 minutes
  WHITEBOARDS: 120, // 2 minutes
  NOTIFICATIONS: 30, // 30 seconds
};
