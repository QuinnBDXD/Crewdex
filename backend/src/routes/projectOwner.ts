import { Router, Request, Response } from 'express';

const router = Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { project_contact_id } = req.body || {};
    if (!project_id || !project_contact_id) {
      return res.status(400).json({ error: 'project_id and project_contact_id required' });
    }
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
