import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendError } from '../utils/apiResponse';

export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((e: z.ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 'Validation error', 400, errors);
        return;
      }
      next(error);
    }
  };
};
