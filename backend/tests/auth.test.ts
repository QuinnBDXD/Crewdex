import request from 'supertest';
import app from '../src/app.js';

describe('login route', () => {
  it('returns token when credentials provided', async () => {
    const res = await request(app).post('/login').send({ email: 'user@example.com', password: 'secret' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 400 without credentials', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
  });
});
