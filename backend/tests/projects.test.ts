import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../src/db', () => ({ prisma: {} }));
import app from '../src/index';

const token = jwt.sign({ account_id: 'acc', role: 'Viewer' }, 'test-secret');

describe('POST /projects', () => {
  it('creates a project with valid payload', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Project',
        client: 'Client',
        location: 'Location',
        creator_name: 'Alice',
        creator_email: 'alice@example.com',
      });
    expect(res.status).toBe(200);
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
  });
});
