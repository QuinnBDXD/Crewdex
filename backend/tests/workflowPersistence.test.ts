process.env.DATABASE_URL = 'file:memorydb?mode=memory&cache=shared'

const { prisma } = require('../src/db')
const { runWorkflow } = require('../src/workflows/engine')

beforeAll(async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "NotificationEvent" (
      "event_id" TEXT PRIMARY KEY,
      "type" TEXT NOT NULL,
      "project_id" TEXT NOT NULL,
      "entity_type" TEXT,
      "entity_id" TEXT,
      "payload" TEXT,
      "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "delivered_to" TEXT,
      "account_id" TEXT NOT NULL
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AuditEvent" (
      "event_id" TEXT PRIMARY KEY,
      "actor" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "entity" TEXT NOT NULL,
      "entity_id" TEXT NOT NULL,
      "before" TEXT,
      "after" TEXT,
      "at" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "account_id" TEXT NOT NULL
    );
  `)
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
