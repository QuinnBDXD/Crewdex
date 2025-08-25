import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { prisma } from '../db';
import { HttpError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const createProjectSchema = z.object({
  name: z.string(),
  client: z.string(),
  location: z.string(),
  creator_name: z.string(),
  creator_email: z.string().email(),
});

router.post(
  '/',
  validate(createProjectSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    try {
      const project = await prisma.project.create({
        data: { ...req.body, account_id: user?.account_id },
      });
      return res.json(project);
    } catch (err) {
      return next(new HttpError(500, 'Failed to create project'));
    }
  },
);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthenticatedRequest;
  try {
    const projects = await prisma.project.findMany({
      where: { account_id: user?.account_id },
    });
    return res.json(projects);
  } catch (err) {
    return next(new HttpError(500, 'Failed to fetch projects'));
  }
});

export default router;
