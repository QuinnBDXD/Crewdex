import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  try {
    const required = ['name', 'client', 'location', 'creator_name', 'creator_email'];
    const missing = required.find((f) => !req.body || !req.body[f]);
    if (missing) {
      return res.status(400).json({ error: `${missing} required` });
    }
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', (_req: Request, res: Response) => {
  try {
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
