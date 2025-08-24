import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (_req: Request, res: Response) => {
  try {
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
