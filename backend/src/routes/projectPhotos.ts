import { Router, Request, Response } from 'express';

const router = Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { file_ref } = req.body || {};
    if (!project_id || !file_ref) {
      return res.status(400).json({ error: 'project_id and file_ref required' });
    }
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
