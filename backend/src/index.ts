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
import portfolioRoutes from './routes/portfolioRoutes';
import milestoneRoutes from './routes/milestoneRoutes';
import tagRoutes from './routes/tagRoutes';
import categoryRoutes from './routes/categoryRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import fileRoutes from './routes/fileRoutes';
import searchRoutes from './routes/searchRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import focusSessionRoutes from './routes/focusSessionRoutes';
import agileRoutes from './routes/agileRoutes';
import teamRoutes from './routes/teamRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import organizationRoutes from './routes/organizationRoutes';
import meetingRoutes from './routes/meetingRoutes';
import tamadMeetRoutes from './routes/tamadMeetRoutes';

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
setupSecurity(app);
app.use(morgan('dev'));

app.use('/api/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/whiteboards', whiteboardRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/focus-sessions', focusSessionRoutes);
app.use('/api/v1/agile', agileRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/dashboards', dashboardRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/tamad-meet', tamadMeetRoutes);

app.get('/api/ready', async (_req, res) => {
  try {
    await connectDB();
    res.status(200).json({ status: 'READY' });
  } catch {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack, requestId: _req.headers['x-request-id'] });
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    requestId: _req.headers['x-request-id'],
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
