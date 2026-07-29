import logger from './logger';

interface EnvVar {
  name: string;
  required: boolean;
  default?: string;
  category: 'server' | 'database' | 'redis' | 'jwt' | 'firebase' | 'ai';
}

const ENV_VARS: EnvVar[] = [
  { name: 'PORT', required: false, default: '5000', category: 'server' },
  { name: 'NODE_ENV', required: false, default: 'development', category: 'server' },
  { name: 'MONGODB_URI', required: true, category: 'database' },
  { name: 'REDIS_URL', required: false, default: 'redis://localhost:6379', category: 'redis' },
  { name: 'JWT_SECRET', required: true, category: 'jwt' },
  { name: 'JWT_REFRESH_SECRET', required: false, category: 'jwt' },
  { name: 'FIREBASE_PROJECT_ID', required: true, category: 'firebase' },
  { name: 'FIREBASE_CLIENT_EMAIL', required: true, category: 'firebase' },
  { name: 'FIREBASE_PRIVATE_KEY', required: true, category: 'firebase' },
  { name: 'GEMINI_API_KEY', required: false, category: 'ai' },
  { name: 'CORS_ORIGIN', required: false, default: 'http://localhost:5173,http://localhost:3000', category: 'server' },
  { name: 'FRONTEND_URL', required: false, default: 'http://localhost:5173', category: 'server' },
];

export const validateEnv = (): void => {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value && envVar.required) {
      missing.push(envVar.name);
    } else if (!value && envVar.default) {
      process.env[envVar.name] = envVar.default;
    } else if (!value && !envVar.required) {
      warnings.push(envVar.name);
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Set these in your .env file or environment. See .env.example for reference.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.warn(`Optional environment variables not set (using defaults): ${warnings.join(', ')}`);
  }

  if (process.env.FIREBASE_PRIVATE_KEY) {
    process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  logger.info('Environment validation passed');
};
