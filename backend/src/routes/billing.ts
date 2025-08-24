import { Router, Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';

const router = Router();

// Stub endpoint to create a subscription. In production this would
// integrate with Stripe's subscription APIs.
router.post('/subscribe', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plan } = req.body || {};
    const { user } = req as AuthenticatedRequest;
    if (!plan) {
      return next(new HttpError(400, 'plan required'));
    }
    // Placeholder response until billing logic is implemented. The
    // account context comes from the authenticated user.
    const account_id = user?.account_id;
    return res.json({ account_id });
  } catch (err) {
    return next(new HttpError(500, 'Internal Server Error'));
  }
});

// Stripe webhook receiver. The payload will be verified and processed
// when billing is implemented.
router.post('/webhook', (_req: Request, res: Response) => {
  return res.json({});
});

export default router;
