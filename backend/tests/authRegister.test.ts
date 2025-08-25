import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import app from '../src/index';

jest.mock('../src/db', () => ({
  prisma: {
    account: { create: jest.fn() },
    accountUser: { create: jest.fn() },
  },
}));

const { prisma } = require('../src/db');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates account and user, returns session token', async () => {
    (prisma.account.create as jest.Mock).mockResolvedValue({ account_id: 'acc1' });
    (prisma.accountUser.create as jest.Mock).mockImplementation(async ({ data }: any) => ({
      user_id: 'user1',
      account_id: data.account_id,
      email: data.email,
      password_hash: data.password_hash,
      project_contact_id: null,
    }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ account_name: 'Acme', email: 'user@example.com', password: 'secret' });

    expect(res.status).toBe(200);
    expect(prisma.account.create).toHaveBeenCalledWith({ data: { name: 'Acme' } });
    const createArgs = (prisma.accountUser.create as jest.Mock).mock.calls[0][0];
    expect(await bcrypt.compare('secret', createArgs.data.password_hash)).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.session).toEqual({
      account_id: 'acc1',
      user_id: 'user1',
      project_contact_id: null,
      role: 'AccountAdmin',
      project_roles: {},
    });
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'secret' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    (prisma.account.create as jest.Mock).mockResolvedValue({ account_id: 'acc1' });
    (prisma.accountUser.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.14.0',
      }),
    );

    const res = await request(app)
      .post('/api/auth/register')
      .send({ account_name: 'Acme', email: 'user@example.com', password: 'secret' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { message: 'Email already registered' } });
  });
});
