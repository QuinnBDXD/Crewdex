import { execSync } from 'child_process'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/crewdex_test'

const { prisma } = require('../src/db')
const { runWorkflow } = require('../src/workflows/engine')

beforeAll(() => {
  execSync('npx prisma migrate deploy', { cwd: __dirname + '/..', stdio: 'inherit', env: process.env })
})

afterEach(async () => {
  await prisma.auditEvent.deleteMany()
  await prisma.notificationEvent.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('runWorkflow persistence', () => {
  it('persists audit and notification events', async () => {
    const sideEffects = [
      {
        type: 'notification' as const,
        notification: {
          type: 'email',
          recipient: 'user@example.com',
          subject: 'Hello',
          body: 'World',
          project_id: 'proj1',
          account_id: 'acc1',
        },
      },
    ]

    const ctx = {
      accountId: 'acc1',
      actor: 'user1',
      entity: 'Project',
      entityId: 'proj1',
      after: { name: 'Test Project' },
    }

    await runWorkflow(sideEffects, ctx)

    const audits = await prisma.auditEvent.findMany({ where: { account_id: 'acc1' } })
    expect(audits).toHaveLength(1)
    expect(audits[0].entity).toBe('Project')

    const notifications = await prisma.notificationEvent.findMany({ where: { account_id: 'acc1' } })
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('email')
  })
})
