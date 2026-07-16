import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db';
import { redis } from './config/redis';
import logger from './utils/logger';
import 'express-async-errors';
import { seedAdmin } from './utils/seed';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: '*', // TODO: restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
import habitRoutes from './routes/habitRoutes';
import goalRoutes from './routes/goalRoutes';
import documentRoutes from './routes/documentRoutes';
import noteRoutes from './routes/noteRoutes';
import whiteboardRoutes from './routes/whiteboardRoutes';
import healthRoutes from './routes/healthRoutes';

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/whiteboards', whiteboardRoutes);

// Health and readiness routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TaMaD API is running' });
});

app.get('/api/ready', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ status: 'READY' });
  } catch {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();

    if (redis.status === 'ready' || redis.status === 'connecting') {
      logger.info('Redis is ready');
    }

    await seedAdmin();

    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
