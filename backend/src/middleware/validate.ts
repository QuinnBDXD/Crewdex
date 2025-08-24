import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodIssue } from 'zod';
import { HttpError } from './errorHandler';

export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue: ZodIssue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new HttpError(400, 'Validation error', details));
    }
    req.body = result.data;
    return next();
  };
}
