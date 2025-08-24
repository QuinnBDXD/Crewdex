import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let status = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof HttpError) {
    status = err.status || 500;
    message = err.message || message;
    details = err.details;
  } else {
    // Log unexpected errors to aid debugging
    console.error(err);
    if (err instanceof Error && err.message) {
      message = err.message;
    }
  }

  const body: any = { message };
  if (details !== undefined) {
    body.details = details;
  }
  res.status(status).json({ error: body });
}
