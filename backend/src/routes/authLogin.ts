import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from '../middleware/errorHandler';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  const { email, project_id } = req.body || {};
  if (!email || !project_id) {
    return next(new HttpError(400, 'email and project_id required'));
  }
  // Placeholder implementation
  return res.json({ session: { project_contact_id: '', role: '', token: '' } });
});

export default router;
