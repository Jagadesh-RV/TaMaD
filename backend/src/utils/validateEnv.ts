import logger from './logger';

export interface EnvVar {
  name: string;
  required: boolean;
  default?: string;
  category: 'server' | 'database' | 'redis' | 'jwt' | 'firebase' | 'ai' | 'smtp' | 'monitoring';
  validate?: (value: string) => string | null;
}

const ENV_VARS: EnvVar[] = [
  { name: 'PORT', required: false, default: '5000', category: 'server' },
  { name: 'NODE_ENV', required: false, default: 'development', category: 'server' },
  { name: 'MONGODB_URI', required: true, category: 'database' },
  { name: 'REDIS_URL', required: false, default: 'redis://localhost:6379', category: 'redis' },
  { name: 'JWT_SECRET', required: true, category: 'jwt', validate: (v) => v.length < 32 ? 'JWT_SECRET must be at least 32 characters' : null },
  { name: 'JWT_REFRESH_SECRET', required: false, category: 'jwt', validate: (v) => v && v.length < 32 ? 'JWT_REFRESH_SECRET must be at least 32 characters' : null },
  { name: 'JWT_EXPIRES_IN', required: false, default: '15m', category: 'jwt' },
  { name: 'FIREBASE_PROJECT_ID', required: true, category: 'firebase' },
  { name: 'FIREBASE_CLIENT_EMAIL', required: true, category: 'firebase' },
  { name: 'FIREBASE_PRIVATE_KEY', required: true, category: 'firebase' },
  { name: 'GEMINI_API_KEY', required: false, category: 'ai' },
  { name: 'CORS_ORIGIN', required: false, default: 'http://localhost:5173,http://localhost:3000', category: 'server' },
  { name: 'FRONTEND_URL', required: false, default: 'http://localhost:5173', category: 'server' },
  { name: 'SMTP_HOST', required: false, category: 'smtp' },
  { name: 'SMTP_PORT', required: false, default: '587', category: 'smtp' },
  { name: 'SMTP_USER', required: false, category: 'smtp' },
  { name: 'SMTP_PASS', required: false, category: 'smtp' },
  { name: 'SMTP_FROM', required: false, default: 'noreply@tamad.app', category: 'smtp' },
  { name: 'SENTRY_DSN', required: false, category: 'monitoring' },
];

export const validateEnv = (): void => {
  const missing: string[] = [];
  const warnings: string[] = [];
  const invalid: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value && envVar.required) {
      missing.push(envVar.name);
    } else if (!value && envVar.default) {
      process.env[envVar.name] = envVar.default;
    } else if (!value && !envVar.required) {
      warnings.push(envVar.name);
    }

    if (value && envVar.validate) {
      const error = envVar.validate(value);
      if (error) invalid.push(`${envVar.name}: ${error}`);
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Set these in your .env file or environment. See .env.example for reference.');
    logger.error('The application will not start until these are configured.');
    process.exit(1);
  }

  if (invalid.length > 0) {
    logger.error(`Invalid environment variables:\n  ${invalid.join('\n  ')}`);
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.warn(`Optional environment variables not set (using defaults): ${warnings.join(', ')}`);
  }

  if (process.env.FIREBASE_PRIVATE_KEY) {
    process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  const environment = process.env.NODE_ENV || 'development';
  logger.info(`Environment validated: ${environment} mode`);

  if (environment === 'production') {
    const prodCheck = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SENTRY_DSN'].filter(
      (k) => !process.env[k]
    );
    if (prodCheck.length > 0) {
      logger.warn(`Production recommended variables not set: ${prodCheck.join(', ')}`);
    }
  }
};
