import request from 'supertest';
import app from '../src/app.js';

describe('create project', () => {
  it('creates project with name', async () => {
    const res = await request(app).post('/projects').send({ name: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test');
  });

  it('returns 400 without name', async () => {
    const res = await request(app).post('/projects').send({});
    expect(res.status).toBe(400);
  });
});
