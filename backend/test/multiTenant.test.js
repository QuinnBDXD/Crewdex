const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
  if (request === '@prisma/client') {
    return { PrismaClient: class { constructor() {} } };
  }
  return originalRequire.apply(this, arguments);
};

require('ts-node/register');
const { test } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const jwt = require('jsonwebtoken');
const supertest = require('supertest');
const routes = require('../src/routes').default;
const { prisma } = require('../src/db');

const app = express();
app.use(express.json());
app.use(routes);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const token = (account_id) => jwt.sign({ account_id, role: 'AccountAdmin' }, JWT_SECRET);

let accounts = [
  { account_id: 'acc1', name: 'Account 1' },
  { account_id: 'acc2', name: 'Account 2' },
];

let projects = [
  { project_id: 'proj1', name: 'Proj1', client: '', location: '', creator_name: '', creator_email: '', account_id: 'acc1' },
  { project_id: 'proj2', name: 'Proj2', client: '', location: '', creator_name: '', creator_email: '', account_id: 'acc2' },
];

prisma.account = {};
prisma.project = {};
prisma.account.findMany = async ({ where }) => accounts.filter((a) => a.account_id === where.account_id);
prisma.account.create = async ({ data }) => { accounts.push(data); return data; };
prisma.project.findMany = async ({ where }) => projects.filter((p) => p.account_id === where.account_id);
prisma.project.create = async ({ data }) => {
  const project = { project_id: `proj${projects.length + 1}`, ...data };
  projects.push(project);
  return project;
};

test('tenant isolation for accounts', async () => {
  const res = await supertest(app).get('/accounts').set('Authorization', `Bearer ${token('acc1')}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 1);
  assert.strictEqual(res.body[0].account_id, 'acc1');
});

test('tenant isolation for projects', async () => {
  const res = await supertest(app).get('/projects').set('Authorization', `Bearer ${token('acc1')}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 1);
  assert(res.body.every((p) => p.account_id === 'acc1'));
});

test('user cannot access another tenant projects', async () => {
  const newProjRes = await supertest(app)
    .post('/projects')
    .set('Authorization', `Bearer ${token('acc1')}`)
    .send({ name: 'NewProj', client: 'c', location: 'l', creator_name: 'n', creator_email: 'e' });
  assert.strictEqual(newProjRes.status, 200);
  assert.strictEqual(newProjRes.body.account_id, 'acc1');

  const otherRes = await supertest(app)
    .get('/projects')
    .set('Authorization', `Bearer ${token('acc2')}`);
  assert.strictEqual(otherRes.status, 200);
  assert(!otherRes.body.some((p) => p.name === 'NewProj'));
});
