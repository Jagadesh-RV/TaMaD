import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Express, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

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
  const isProd = process.env.NODE_ENV === 'production';
  return rateLimit({
    windowMs,
    max: isProd ? max : Math.max(max, 3000),
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

// Sanitize request body - strip potential XSS/injection from string fields
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeHtml(obj, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'width', 'height']
          }
        }).trim();
      }
      if (Array.isArray(obj)) return obj.map(sanitize);
      if (obj && typeof obj === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleaned: any = {};
        for (const key of Object.keys(obj)) {
          cleaned[key] = sanitize(obj[key]);
        }
        return cleaned;
      }
      return obj;
    };
    req.body = sanitize(req.body);
  }
  next();
};

// Add request ID for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.headers['x-request-id']);
  next();
};

export const setupSecurity = (app: Express) => {
  app.use(requestId);
  app.use(securityHeaders);
  app.use(sanitizeInput);
  app.use('/api', globalRateLimiter);
  app.use('/api/v1/auth', authRateLimiter);
  app.use('/api/v1/contact', strictRateLimiter);
};
