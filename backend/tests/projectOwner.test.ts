import request from 'supertest';
import jwt from 'jsonwebtoken';

const upsertMock = jest.fn();

jest.mock('../src/db', () => ({
  prisma: {
    projectAccess: {
      upsert: upsertMock,
    },
  },
}));

import app from '../src/index';

const token = jwt.sign(
  {
    account_id: 'acc',
    role: 'AccountAdmin',
    project_contact_id: 'pc1',
    project_roles: { p1: 'ProjectOwner' },
  },
  'test-secret',
);

beforeEach(() => {
  upsertMock.mockReset();
});

describe('POST /api/projects/:project_id/owner', () => {
  it('assigns project owner and scopes by account', async () => {
    upsertMock.mockResolvedValue({
      project_access_id: 'p1',
      project_id: 'p1',
      project_contact_id: 'pc2',
      role: 'ProjectOwner',
      account_id: 'acc',
    });
    const res = await request(app)
      .post('/api/projects/p1/owner')
      .set('Authorization', `Bearer ${token}`)
      .send({ project_contact_id: 'pc2' });
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith({
      where: { project_access_id: 'p1' },
      update: {
        project_contact_id: 'pc2',
        role: 'ProjectOwner',
        account_id: 'acc',
        project_id: 'p1',
      },
      create: {
        project_access_id: 'p1',
        project_id: 'p1',
        project_contact_id: 'pc2',
        role: 'ProjectOwner',
        account_id: 'acc',
      },
    });
    expect(res.body).toEqual({
      project_access_id: 'p1',
      project_id: 'p1',
      project_contact_id: 'pc2',
      role: 'ProjectOwner',
      account_id: 'acc',
    });
  });

  it('returns 400 when project_contact_id missing', async () => {
    const res = await request(app)
      .post('/api/projects/p1/owner')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });
});

