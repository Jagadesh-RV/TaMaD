import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './sockets/socketManager';
import { connectDB } from './config/db';
import { redis } from './config/redis';
import logger from './utils/logger';
import { validateEnv } from './utils/validateEnv';
import { startBackgroundJobs } from './utils/jobs';
import { setupSecurity } from './utils/security';
import 'express-async-errors';

dotenv.config();
validateEnv();

const app = express();
const httpServer = createServer(app);

export const io = initSocket(httpServer);

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
import habitRoutes from './routes/habitRoutes';
import goalRoutes from './routes/goalRoutes';
import documentRoutes from './routes/documentRoutes';
import noteRoutes from './routes/noteRoutes';
import whiteboardRoutes from './routes/whiteboardRoutes';
import healthRoutes from './routes/healthRoutes';
import commentRoutes from './routes/commentRoutes';
import aiRoutes from './routes/aiRoutes';
import contactRoutes from './routes/contactRoutes';
import notificationRoutes from './routes/notificationRoutes';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'wss:'],
      fontSrc: ["'self'", 'data:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/ready', async (_req, res) => {
  try {
    await connectDB();
    res.status(200).json({ status: 'READY' });
  } catch {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    if (redis.status === 'ready' || redis.status === 'connecting') {
      logger.info('Redis is connected');
    }

    startBackgroundJobs();

    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
