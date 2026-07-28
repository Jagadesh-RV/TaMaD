import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'wss:'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message || 'Too many requests, please try again later.' },
  });
};

export const globalRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests, please try again later.'
);

export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  50,
  'Too many authentication attempts, please try again later.'
);

export const strictRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many requests, please try again later.'
);

export const setupSecurity = (app: Express) => {
  app.use(securityHeaders);
  app.use('/api', globalRateLimiter);
  app.use('/api/auth', authRateLimiter);
  app.use('/api/contact', strictRateLimiter);
};
