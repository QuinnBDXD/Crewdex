CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "NotificationEvent" (
  "event_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "payload" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "delivered_to" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "account_id" TEXT NOT NULL
);

CREATE INDEX "NotificationEvent_account_id_idx" ON "NotificationEvent" ("account_id");
CREATE INDEX "NotificationEvent_project_id_idx" ON "NotificationEvent" ("project_id");

CREATE TABLE "AuditEvent" (
  "event_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "account_id" TEXT NOT NULL
);

CREATE INDEX "AuditEvent_account_id_idx" ON "AuditEvent" ("account_id");
