import { Request, Response, NextFunction } from 'express';
import { cache } from '../utils/cache';
import { AuthRequest } from './auth';

type KeyGenerator = (req: AuthRequest) => string;

export const cacheMiddleware = (keyGenerator: KeyGenerator, ttl: number = 300) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = keyGenerator(req);
    const cached = await cache.get(key);

    if (cached) {
      res.json(cached);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      cache.set(key, body, ttl);
      return originalJson(body);
    }) as Response['json'];

    next();
  };
};
