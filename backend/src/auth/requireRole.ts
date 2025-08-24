import { Request, Response, NextFunction } from 'express';

export type Role = 'AccountAdmin' | 'ProjectOwner' | 'ProjectAdmin' | 'Viewer';
export type Permission = Role[] | 'public' | 'authenticated';

/**
 * Middleware to enforce role-based access control on routes.
 * - `public` routes bypass all checks.
 * - `authenticated` routes require `req.user` to be present.
 * - Role arrays restrict access to matching roles.
 */
export default function requireRole(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Public routes are always allowed
    if (permission === 'public') {
      return next();
    }

    const user = (req as any).user as { role?: Role } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (permission === 'authenticated') {
      return next();
    }

    if (Array.isArray(permission)) {
      if (user.role && permission.includes(user.role)) {
        return next();
      }
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fallback deny
    return res.status(403).json({ error: 'Forbidden' });
  };
}
