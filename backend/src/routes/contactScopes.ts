import { Router, Request, Response } from 'express';

const router = Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  try {
    const { project_id, project_contact_id } = req.params;
    const { scopecode, activity_labels } = req.body || {};
    if (!project_id || !project_contact_id || !scopecode || !Array.isArray(activity_labels)) {
      return res.status(400).json({ error: 'project_id, project_contact_id, scopecode and activity_labels required' });
    }
    return res.json({});
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const { project_id, project_contact_id } = req.params;
    if (!project_id || !project_contact_id) {
      return res.status(400).json({ error: 'project_id and project_contact_id required' });
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
