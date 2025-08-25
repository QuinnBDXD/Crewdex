import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/index';

jest.mock('../src/db', () => ({
  prisma: {
    projectContact: {
      findUnique: jest.fn(),
    },
    projectAccess: {
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = require('../src/db');

describe('POST /auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in with valid credentials', async () => {
    const password = 'secret';
    const hash = await bcrypt.hash(password, 10);
    (prisma.projectContact.findUnique as jest.Mock).mockResolvedValue({
      account_id: 'acc1',
      project_contact_id: 'pc1',
      role: 'Viewer',
      password_hash: hash,
    });
    (prisma.projectAccess.findMany as jest.Mock).mockResolvedValue([
      { project_id: 'proj1', role: 'Viewer' },
    ]);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password, project_id: 'proj1' });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.session).toEqual({
      account_id: 'acc1',
      project_contact_id: 'pc1',
      role: 'Viewer',
      project_roles: { proj1: 'Viewer' },
    });
  });

  it('rejects invalid password', async () => {
    const hash = await bcrypt.hash('secret', 10);
    (prisma.projectContact.findUnique as jest.Mock).mockResolvedValue({
      account_id: 'acc1',
      project_contact_id: 'pc1',
      role: 'Viewer',
      password_hash: hash,
    });
    (prisma.projectAccess.findMany as jest.Mock).mockResolvedValue([
      { project_id: 'proj1', role: 'Viewer' },
    ]);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrong', project_id: 'proj1' });

    expect(res.status).toBe(401);
  });

  it('rejects when project scope does not match', async () => {
    (prisma.projectContact.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.projectAccess.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'secret', project_id: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', project_id: 'proj1' });

    expect(res.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'not-an-email',
        password: 'secret',
        project_id: 'proj1',
      });

    expect(res.status).toBe(400);
  });
});
