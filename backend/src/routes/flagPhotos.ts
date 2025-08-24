import { Router, Request, Response } from 'express';

const router = Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  try {
    const { project_id, flag_id } = req.params;
    const { photo_id } = req.body || {};
    if (!project_id || !flag_id || !photo_id) {
      return res.status(400).json({ error: 'project_id, flag_id and photo_id required' });
    }
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
