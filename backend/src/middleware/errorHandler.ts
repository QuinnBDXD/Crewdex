import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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

  if (err instanceof HttpError) {
    status = err.status || 500;
    message = err.message || message;
  } else {
    // Log unexpected errors to aid debugging
    console.error(err);
    if (err instanceof Error && err.message) {
      message = err.message;
    }
  }

  res.status(status).json({ error: { message } });
}
