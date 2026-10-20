import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthError } from '../services/auth.service.js';
import { logger } from '../config/logger.js';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AuthError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ message: 'Internal server error' });
}
