import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

export default router;
