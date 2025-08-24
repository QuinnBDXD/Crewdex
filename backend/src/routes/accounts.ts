import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { HttpError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

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
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const accounts = await prisma.account.findMany({
      where: { account_id: user?.account_id },
    });
    return res.json(accounts);
  } catch (err) {
    return next(new HttpError(500, 'Failed to fetch accounts'));
  }
});

export default router;
