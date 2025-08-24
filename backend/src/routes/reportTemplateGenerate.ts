import { Router, Request, Response } from 'express';

const router = Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  try {
    const { project_id, template_id } = req.params;
    if (!project_id || !template_id) {
      return res.status(400).json({ error: 'project_id and template_id required' });
    }
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
