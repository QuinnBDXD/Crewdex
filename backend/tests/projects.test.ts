import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/index';

jest.mock('../src/db', () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = require('../src/db');

const tokenFor = (account_id: string) =>
  jwt.sign({ account_id, role: 'Viewer' }, process.env.JWT_SECRET || 'test-secret');

describe('Projects routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes project creation to user account', async () => {
    (prisma.project.create as jest.Mock).mockResolvedValue({
      project_id: 'p1',
      account_id: 'acc1',
    });

    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${tokenFor('acc1')}`)
      .send({
        name: 'Name',
        client: 'Client',
        location: 'Loc',
        creator_name: 'Creator',
        creator_email: 'creator@example.com',
        account_id: 'acc2',
      });

    expect(res.status).toBe(200);
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ account_id: 'acc1' }),
    });
  });

  it('scopes project listing to user account', async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([
      { project_id: 'p1', account_id: 'acc1', name: 'Name' },
    ]);

    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${tokenFor('acc1')}`);

    expect(res.status).toBe(200);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { account_id: 'acc1' },
    });
    expect(res.body).toEqual([
      { project_id: 'p1', account_id: 'acc1', name: 'Name' },
    ]);
  });

  it('prevents cross-tenant access', async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${tokenFor('acc2')}`);

    expect(res.status).toBe(200);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { account_id: 'acc2' },
    });
    expect(res.body).toEqual([]);
  });
});
