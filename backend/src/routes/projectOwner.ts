import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

const assignOwnerSchema = z.object({
  project_contact_id: z.string(),
});

router.post(
  '/',
  validate(assignOwnerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { project_id } = req.params;
    const { user } = req as AuthenticatedRequest;
    if (!project_id) {
      return next(new HttpError(400, 'project_id required'));
    }
    const { project_contact_id } = req.body as { project_contact_id: string };
    try {
      const access = await prisma.projectAccess.upsert({
        where: { project_access_id: project_id },
        update: {
          project_contact_id,
          role: 'ProjectOwner' as any,
          account_id: user?.account_id,
          project_id,
        },
        create: {
          project_access_id: project_id,
          project_id,
          project_contact_id,
          role: 'ProjectOwner' as any,
          account_id: user?.account_id,
        },
      });
      return res.json(access);
    } catch (err) {
      return next(new HttpError(500, 'Failed to assign project owner'));
    }
  },
);

export default router;
