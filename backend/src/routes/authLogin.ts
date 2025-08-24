import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { HttpError } from '../middleware/errorHandler';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, project_id } = req.body || {};
  if (!email || !password || !project_id) {
    return next(new HttpError(400, 'email, password and project_id required'));
  }
  try {
    const contact: any = await prisma.projectContact.findUnique({
      where: { project_id_email: { project_id, email } },
    });
    if (
      !contact ||
      !(await bcrypt.compare(password, contact.password_hash || ''))
    ) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      {
        account_id: contact.account_id,
        project_contact_id: contact.project_contact_id,
        role: contact.role || '',
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });
    return res.json({
      session: {
        account_id: contact.account_id,
        project_contact_id: contact.project_contact_id,
        role: contact.role || '',
      },
    });
  } catch (err) {
    return next(new HttpError(500, 'Login failed'));
  }
});

export default router;
