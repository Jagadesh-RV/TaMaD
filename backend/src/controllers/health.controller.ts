import { Request, Response } from 'express';
import mongoose from 'mongoose';

const READY_STATE_MAP: Record<number, string> = {
  0: 'DOWN',
  1: 'UP',
  2: 'CONNECTING',
  3: 'DISCONNECTING',
};

export const health = (_req: Request, res: Response) => {
  const readyState = mongoose.connection.readyState;
  const dbStatus = READY_STATE_MAP[readyState] ?? 'UNKNOWN';
  const statusCode = readyState === 1 ? 200 : 503;

  res.status(statusCode).json({
    status: dbStatus === 'UP' ? 'OK' : 'DEGRADED',
    service: 'backend',
    db: dbStatus,
  });
};
