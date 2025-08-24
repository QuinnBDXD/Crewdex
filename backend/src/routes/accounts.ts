import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { HttpError } from '../middleware/errorHandler';
import { auth } from '../middleware/auth';

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

// All routes below this line require authentication
router.use(auth);

// Fetch the authenticated account
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await prisma.account.findUnique({
      where: { id: req.account_id },
    });
    if (!account) {
      return next(new HttpError(404, 'Account not found'));
    }
    return res.json(account);
  } catch (err) {
    return next(new HttpError(500, 'Failed to fetch accounts'));
  }
});

export default router;
