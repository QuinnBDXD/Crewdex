import { Router, Request, Response } from 'express';

const router = Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const required = ['name', 'email'];
    const missing = !project_id ? 'project_id' : required.find((f) => !req.body || !req.body[f]);
    if (missing) {
      return res.status(400).json({ error: `${missing} required` });
    }
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
