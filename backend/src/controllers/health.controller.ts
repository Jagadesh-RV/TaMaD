import { Request, Response } from 'express';

export const health = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'backend' });
};
