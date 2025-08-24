export interface AuditEvent {
  entity: string;
  action: 'create' | 'update';
  actor: string;
  entityId: string;
  timestamp: Date;
  changes?: Record<string, { before: any; after: any }>;
}

const auditLog: AuditEvent[] = [];

export function logCreate(
  entity: string,
  entityId: string,
  actor: string,
  data: Record<string, any>
): AuditEvent {
  const changes: Record<string, { before: any; after: any }> = {};
  for (const [key, value] of Object.entries(data)) {
    changes[key] = { before: undefined, after: value };
  }
  const event: AuditEvent = {
    entity,
    entityId,
    actor,
    action: 'create',
    timestamp: new Date(),
    changes,
  };
  auditLog.push(event);
  console.log(`AUDIT create ${entity} ${entityId}`);
  return event;
}

export function logUpdate(
  entity: string,
  entityId: string,
  actor: string,
  before: Record<string, any>,
  after: Record<string, any>
): AuditEvent {
  const changes: Record<string, { before: any; after: any }> = {};
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      changes[key] = { before: before[key], after: after[key] };
    }
  }
  const event: AuditEvent = {
    entity,
    entityId,
    actor,
    action: 'update',
    timestamp: new Date(),
    changes,
  };
  auditLog.push(event);
  console.log(`AUDIT update ${entity} ${entityId}`);
  return event;
}

export function getAuditLog(): AuditEvent[] {
  return auditLog;
}
