import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const projectAccessMiddleware = (allowedRoles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    const { project_id } = req.params as { project_id?: string };

    if (!user || !project_id) {
      return res.status(400).json({ error: 'project_id required' });
    }

    const role = user.project_roles[project_id];
    if (!role || (allowedRoles.length && !allowedRoles.includes(role))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
};
