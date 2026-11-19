import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Return 400 validation error directly instead of next(error)
      // This ensures consistent error format via the error handler
      res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten(),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
