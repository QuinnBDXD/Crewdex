import request from 'supertest';
import jwt from 'jsonwebtoken';

const createMock = jest.fn();

jest.mock('../src/db', () => ({
  prisma: {
    projectContact: {
      create: createMock,
    },
  },
}));

import app from '../src/index';

const token = jwt.sign(
  {
    account_id: 'acc',
    role: 'AccountAdmin',
    project_contact_id: 'pc1',
    project_roles: { p1: 'ProjectAdmin' },
  },
  'test-secret',
);

beforeEach(() => {
  createMock.mockReset();
});

describe('POST /api/projects/:project_id/contacts', () => {
  it('persists contact with account and project scoping', async () => {
    createMock.mockResolvedValue({
      project_contact_id: 'pc2',
      project_id: 'p1',
      account_id: 'acc',
      name: 'Bob',
      email: 'bob@example.com',
    });
    const payload = { name: 'Bob', email: 'bob@example.com' };
    const res = await request(app)
      .post('/api/projects/p1/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith({
      data: { ...payload, project_id: 'p1', account_id: 'acc' },
    });
    expect(res.body).toEqual({
      project_contact_id: 'pc2',
      project_id: 'p1',
      account_id: 'acc',
      name: 'Bob',
      email: 'bob@example.com',
    });
  });

  it('returns 400 on invalid payload', async () => {
    const res = await request(app)
      .post('/api/projects/p1/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bob' });
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });
});

