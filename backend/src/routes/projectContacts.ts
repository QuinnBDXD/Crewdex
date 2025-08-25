import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

const createContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  discipline: z.string().optional(),
  role: z.string().optional(),
  visibility: z.string().optional(),
});

router.post(
  '/',
  validate(createContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { project_id } = req.params;
    const { user } = req as AuthenticatedRequest;
    if (!project_id) {
      return next(new HttpError(400, 'project_id required'));
    }
    try {
      const contact = await prisma.projectContact.create({
        data: {
          ...req.body,
          project_id,
          account_id: user?.account_id,
        },
      });
      return res.json(contact);
    } catch (err) {
      return next(new HttpError(500, 'Failed to create project contact'));
    }
  },
);

export default router;
