import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';

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
  (_req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json({});
    } catch (err) {
      return next(err);
    }
  },
);

router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json([]);
  } catch (err) {
    return next(err);
  }
});

export default router;
