import { Router, Request, Response } from 'express';

const router = Router();

// Stub endpoint to create a subscription. In production this would
// integrate with Stripe's subscription APIs.
router.post('/subscribe', (req: Request, res: Response) => {
  try {
    const { account_id, plan } = req.body || {};
    if (!account_id || !plan) {
      return res.status(400).json({ error: 'account_id and plan required' });
    }
    // Placeholder response until billing logic is implemented
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Stripe webhook receiver. The payload will be verified and processed
// when billing is implemented.
router.post('/webhook', (_req: Request, res: Response) => {
  return res.json({});
});

export default router;
