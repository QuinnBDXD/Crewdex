import request from 'supertest';
import jwt from 'jsonwebtoken';

const createMock = jest.fn();
const findManyMock = jest.fn();

jest.mock('../src/db', () => ({
  prisma: {
    project: {
      create: createMock,
      findMany: findManyMock,
    },
  },
}));
import app from '../src/index';

const token = jwt.sign({ account_id: 'acc', role: 'Viewer' }, 'test-secret');

beforeEach(() => {
  createMock.mockReset();
  findManyMock.mockReset();
});

describe('POST /projects', () => {
  it('persists account_id for tenant isolation', async () => {
    createMock.mockResolvedValue({ project_id: 'p1', account_id: 'acc' });
    const payload = {
      name: 'Project',
      client: 'Client',
      location: 'Location',
      creator_name: 'Alice',
      creator_email: 'alice@example.com',
    };
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith({
      data: { ...payload, account_id: 'acc' },
    });
  });

  it('returns 400 on invalid payload', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Project',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation error');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(createMock).not.toHaveBeenCalled();
  });
});

describe('GET /projects', () => {
  it('filters projects by account_id', async () => {
    findManyMock.mockResolvedValue([
      { project_id: 'p1', name: 'Proj', account_id: 'acc' },
    ]);
    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { account_id: 'acc' },
    });
    expect(res.body).toEqual([
      { project_id: 'p1', name: 'Proj', account_id: 'acc' },
    ]);
  });
});
