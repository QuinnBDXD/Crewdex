import express from 'express';

const app = express();
app.use(express.json());

app.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (email && password) {
    return res.json({ token: 'fake-jwt-token' });
  }
  return res.status(400).json({ error: 'Invalid credentials' });
});

app.post('/projects', (req, res) => {
  const { name } = req.body as { name?: string };
  if (name) {
    return res.status(201).json({ id: '1', name });
  }
  return res.status(400).json({ error: 'Name required' });
});

export default app;
