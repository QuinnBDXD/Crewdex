import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { HttpError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Create a new project scoped to the authenticated user's account
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const required = ['name', 'client', 'location', 'creator_name', 'creator_email'];
  const missing = required.find((f) => !req.body || !req.body[f]);
  if (missing) {
    return next(new HttpError(400, `${missing} required`));
  }
  try {
    const { user } = req as AuthenticatedRequest;
    const project = await prisma.project.create({
      data: {
        name: req.body.name,
        client: req.body.client,
        location: req.body.location,
        creator_name: req.body.creator_name,
        creator_email: req.body.creator_email,
        account_id: user!.account_id,
      },
    });
    return res.json(project);
  } catch (err) {
    return next(new HttpError(500, 'Failed to create project'));
  }
});

// List projects for the authenticated user's account
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const projects = await prisma.project.findMany({
      where: { account_id: user!.account_id },
    });
    return res.json(projects);
  } catch (err) {
    return next(new HttpError(500, 'Failed to fetch projects'));
  }
});

export default router;
