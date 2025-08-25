import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { HttpError } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type LoginPayload = z.infer<typeof loginSchema>;

router.post(
  '/',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginPayload;
    try {
      const user: any = await (prisma as any).accountUser.findUnique({
        where: { email },
      });
      if (!user || !(await bcrypt.compare(password, user.password_hash || ''))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const contacts: Array<{ project_contact_id: string }> = await prisma
        .projectContact.findMany({
          where: { email, account_id: user.account_id },
          select: { project_contact_id: true },
        });
      const accesses = await prisma.projectAccess.findMany({
        where: {
          project_contact_id: {
            in: contacts.map((c) => c.project_contact_id),
          },
        },
        select: { project_id: true, role: true },
      });
      const project_roles: Record<string, string> = {};
      accesses.forEach((a: { project_id: string; role: string }) => {
        project_roles[a.project_id] = a.role;
      });
      const role = user.role || 'AccountAdmin';
      const token = jwt.sign(
        {
          account_id: user.account_id,
          user_id: user.user_id,
          role,
          project_roles,
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
          account_id: user.account_id,
          user_id: user.user_id,
          role,
          project_roles,
        },
      });
    } catch (err) {
      return next(new HttpError(500, 'Login failed'));
    }
  },
);

export default router;
