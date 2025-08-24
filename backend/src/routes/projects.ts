import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const required = ['name', 'client', 'location', 'creator_name', 'creator_email'];
    const missing = required.find((f) => !req.body || !req.body[f]);
    if (missing) {
      return res.status(400).json({ error: `${missing} required` });
    }
    const { name, client, location, creator_name, creator_email } = req.body;
    const project = await prisma.project.create({
      data: {
        account_id: req.user!.account_id,
        name,
        client,
        location,
        creator_name,
        creator_email,
      },
    });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { account_id: req.user!.account_id },
    });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
