import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { Prisma } from '@prisma/client';
import { HttpError } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const registerSchema = z.object({
  account_name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

type RegisterPayload = z.infer<typeof registerSchema>;

router.post(
  '/',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_name, email, password } = req.body as RegisterPayload;
    try {
      const account = await (prisma as any).account.create({ data: { name: account_name } });
      const password_hash = await bcrypt.hash(password, 10);
      const user = await (prisma as any).accountUser.create({
        data: {
          account_id: account.account_id,
          email,
          password_hash,
        },
      });
      const token = jwt.sign(
        {
          account_id: account.account_id,
          user_id: user.user_id,
          project_contact_id: user.project_contact_id,
          role: 'AccountAdmin',
          project_roles: {},
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
          account_id: account.account_id,
          user_id: user.user_id,
          project_contact_id: user.project_contact_id,
          role: 'AccountAdmin',
          project_roles: {},
        },
      });
    } catch (err) {
      console.error(err);
      if (err instanceof Prisma.PrismaClientInitializationError) {
        return next(new HttpError(503, 'Database unavailable'));
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return next(new HttpError(409, 'Email already registered'));
      }
      return next(new HttpError(500, 'Registration failed'));
    }
  },
);

export default router;
