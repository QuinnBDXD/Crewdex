export interface NotificationEvent {
  type: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: Date;
}

const events: NotificationEvent[] = [];

export async function dispatch(event: NotificationEvent): Promise<void> {
  events.push(event);
  await sendEmail(event);
}

async function sendEmail(event: NotificationEvent): Promise<void> {
  // Email send stub
  console.log(`Email to ${event.recipient}: ${event.subject}`);
}

export function getDispatchedEvents(): NotificationEvent[] {
  return events;
}
