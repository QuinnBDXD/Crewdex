import { NotificationEvent as DBNotificationEvent } from '@prisma/client'
import { prisma } from '../db'
import { logger } from '../logger'

export interface NotificationEvent {
  type: string
  recipient: string
  subject: string
  body: string
  timestamp: Date
  project_id: string
  account_id: string
}

export async function dispatch(event: NotificationEvent): Promise<void> {
  try {
    await prisma.notificationEvent.create({
      data: {
        type: event.type,
        project_id: event.project_id,
        entity_type: null,
        entity_id: null,
        payload: { recipient: event.recipient, subject: event.subject, body: event.body },
        created_at: event.timestamp,
        delivered_to: [event.recipient],
        account_id: event.account_id,
      },
    })
    await sendEmail(event)
  } catch (err) {
    logger.error({ err }, 'Failed to dispatch notification')
    throw err
  }
}

async function sendEmail(event: NotificationEvent): Promise<void> {
  // Email send stub
  logger.info(`Email to ${event.recipient}: ${event.subject}`)
}

export function getDispatchedEvents(accountId: string): Promise<DBNotificationEvent[]> {
  return prisma.notificationEvent.findMany({
    where: { account_id: accountId },
    orderBy: { created_at: 'desc' },
  })
}
