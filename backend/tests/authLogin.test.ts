import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/index';

jest.mock('../src/db', () => ({
  prisma: {
    accountUser: { findUnique: jest.fn() },
    projectContact: { findMany: jest.fn() },
    projectAccess: { findMany: jest.fn() },
  },
}));

const { prisma } = require('../src/db');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in with valid credentials', async () => {
    const password = 'secret';
    const hash = await bcrypt.hash(password, 10);
    (prisma.accountUser.findUnique as jest.Mock).mockResolvedValue({
      account_id: 'acc1',
      user_id: 'user1',
      password_hash: hash,
    });
    (prisma.projectContact.findMany as jest.Mock).mockResolvedValue([
      { project_contact_id: 'pc1' },
    ]);
    (prisma.projectAccess.findMany as jest.Mock).mockResolvedValue([
      { project_id: 'proj1', role: 'Viewer' },
    ]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.session).toEqual({
      account_id: 'acc1',
      user_id: 'user1',
      role: 'AccountAdmin',
      project_roles: { proj1: 'Viewer' },
    });
  });

  it('rejects invalid password', async () => {
    const hash = await bcrypt.hash('secret', 10);
    (prisma.accountUser.findUnique as jest.Mock).mockResolvedValue({
      account_id: 'acc1',
      user_id: 'user1',
      password_hash: hash,
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown user', async () => {
    (prisma.accountUser.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'secret' });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'secret' });
    expect(res.status).toBe(400);
  });
});
