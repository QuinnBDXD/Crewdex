import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/index';

jest.mock('../src/db', () => ({
  prisma: {
    account: { create: jest.fn() },
    accountUser: { create: jest.fn() },
  },
}));

const { prisma } = require('../src/db');

describe('POST /auth/register', () => {
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
      .post('/auth/register')
      .send({ account_name: 'Acme', email: 'user@example.com', password: 'secret' });

    expect(res.status).toBe(200);
    expect(prisma.account.create).toHaveBeenCalledWith({ data: { name: 'Acme' } });
    const createArgs = (prisma.accountUser.create as jest.Mock).mock.calls[0][0];
    expect(await bcrypt.compare('secret', createArgs.data.password_hash)).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.session).toEqual({
      account_id: 'acc1',
      account_user_id: 'user1',
      project_contact_id: null,
      role: 'AccountAdmin',
      project_roles: {},
    });
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'secret' });
    expect(res.status).toBe(400);
  });
});
