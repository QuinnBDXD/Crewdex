import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from './auth';

export const projectAccessMiddleware = (allowedRoles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    const { project_id } = req.params as { project_id?: string };

    if (!user || !project_id) {
      return res.status(400).json({ error: 'project_id required' });
    }

    if (user.role === 'AccountAdmin' && allowedRoles.includes('AccountAdmin')) {
      return next();
    }

    try {
      const access = await prisma.projectAccess.findFirst({
        where: {
          project_id,
          project_contact_id: user.project_contact_id,
          account_id: user.account_id,
        },
      });
      const role = access?.role as string | undefined;
      if (!role || (allowedRoles.length && !allowedRoles.includes(role))) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return next();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to verify project access' });
    }
  };
};
