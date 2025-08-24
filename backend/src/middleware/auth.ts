import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  account_id: string;
  role: string;
  project_contact_id: string;
  project_roles: Record<string, string>;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export const authMiddleware = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers['authorization'];
    const tokenFromHeader =
      header && header.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = req.cookies?.token || tokenFromHeader;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
      (req as AuthenticatedRequest).user = {
        account_id: payload.account_id,
        role: payload.role,
        project_contact_id: payload.project_contact_id,
        project_roles: payload.project_roles || {},
      };
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};
