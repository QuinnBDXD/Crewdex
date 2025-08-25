import { AuditEvent } from '@prisma/client'
import { prisma } from './db'
import { logger } from './logger'

export async function logCreate(
  accountId: string,
  entity: string,
  entityId: string,
  actor: string,
  data: Record<string, any>
): Promise<AuditEvent> {
  const event = await prisma.auditEvent.create({
    data: {
      account_id: accountId,
      actor,
      action: 'create',
      entity,
      entity_id: entityId,
      before: {},
      after: data,
      at: new Date(),
    },
  })
  logger.info(`AUDIT create ${entity} ${entityId}`)
  return event
}

export async function logUpdate(
  accountId: string,
  entity: string,
  entityId: string,
  actor: string,
  before: Record<string, any>,
  after: Record<string, any>
): Promise<AuditEvent> {
  const event = await prisma.auditEvent.create({
    data: {
      account_id: accountId,
      actor,
      action: 'update',
      entity,
      entity_id: entityId,
      before,
      after,
      at: new Date(),
    },
  })
  logger.info(`AUDIT update ${entity} ${entityId}`)
  return event
}

export function getAuditLog(accountId: string): Promise<AuditEvent[]> {
  return prisma.auditEvent.findMany({
    where: { account_id: accountId },
    orderBy: { at: 'desc' },
  })
}
