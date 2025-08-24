import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { HttpError } from '../middleware/errorHandler';

const router = Router();

// Create a new account
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body || {};
  if (!name) {
    return next(new HttpError(400, 'name required'));
  }
  try {
    const account = await prisma.account.create({
      data: { name },
    });
    return res.json(account);
  } catch (err) {
    return next(new HttpError(500, 'Failed to create account'));
  }
});

// List all accounts
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await prisma.account.findMany();
    return res.json(accounts);
  } catch (err) {
    return next(new HttpError(500, 'Failed to fetch accounts'));
  }
});

export default router;
