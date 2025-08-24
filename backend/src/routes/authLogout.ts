import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.json({ ok: true });
});

export default router;
