import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from './errorHandler';

interface JwtPayload {
  account_id?: string;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      account_id?: string;
    }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return next(new HttpError(401, 'Unauthorized'));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    if (!payload.account_id) {
      return next(new HttpError(401, 'Unauthorized'));
    }
    req.account_id = payload.account_id;
    return next();
  } catch (err) {
    return next(new HttpError(401, 'Unauthorized'));
  }
}
