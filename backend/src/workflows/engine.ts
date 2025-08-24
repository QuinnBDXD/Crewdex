import { dispatch, NotificationEvent } from '../notifications/dispatcher';
import { logCreate, logUpdate } from '../audit';

export interface SideEffect {
  type: 'notification';
  notification: Omit<NotificationEvent, 'timestamp'>;
}

export interface WorkflowContext {
  actor: string;
  entity: string;
  entityId: string;
  before?: Record<string, any>;
  after: Record<string, any>;
}

export async function runWorkflow(
  sideEffects: SideEffect[],
  ctx: WorkflowContext
): Promise<void> {
  for (const effect of sideEffects) {
    if (effect.type === 'notification') {
      await dispatch({ ...effect.notification, timestamp: new Date() });
    }
  }

  if (ctx.before) {
    logUpdate(ctx.entity, ctx.entityId, ctx.actor, ctx.before, ctx.after);
  } else {
    logCreate(ctx.entity, ctx.entityId, ctx.actor, ctx.after);
  }
}
