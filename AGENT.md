AGENT.md
Purpose

Generate the Crewdex App as a SaaS-ready, multi-tenant Progressive Web App (PWA).
The system must support:

Multi-tenant accounts (each customer isolated)

RBAC (roles from YAML spec)

Workflows and entities defined in the YAML

Responsive UI across desktop, tablet, and phone

PWA features (offline, installable, updateable)

SaaS essentials (auth, billing hooks, subscriptions)

1. Tech Stack

Database: PostgreSQL (multi-tenant)

ORM: Prisma

API: Node.js + Express (TypeScript)

Auth: JWT for sessions, user identity via ProjectContact or Supabase/Auth provider

RBAC: Roles (AccountAdmin, ProjectOwner, ProjectAdmin, Viewer) enforced per route

Frontend: React + Vite + Tailwind (shadcn/ui where needed)

PWA: Vite PWA plugin + Service Worker

Billing: Stripe (stub in API, not implemented until production)

2. SaaS Multi-Tenancy

Every entity row must include account_id to enforce tenant isolation.

Option A (default): Single DB with row-level filters (all queries scoped by account_id).

Option B (advanced): Schema or DB per tenant (optional, not default).

RBAC roles apply within an account (AccountAdmin cannot cross into other accounts).

Ensure Project, ProjectContact, Scope, etc. all reference account_id.

3. Auth Model

SaaS user login: email + password (or OAuth) = AccountUser.

Linking: Each AccountUser maps to one or more ProjectContact inside projects.

Session token: JWT containing { account_id, project_contact_id, role }.

Password reset: required for SaaS.

SSO/OAuth: optional extension.

ShareLink tokens: continue to allow view-only, scoped to project.

4. Database Rules

Entities from YAML = Prisma models.

idKey → UUID primary keys.

Constraints from YAML (unique, inclusion, derived) enforced.

Add account_id where missing to ensure tenant separation.

Enums created from YAML fields.

Indexes on account_id, project_id, week.

5. API Rules

Generate Express routes from YAML routes.

Input validation required.

Enforce permissions via RBAC middleware.

6. Workflows

Implement orchestrators from YAML workflows with SaaS in mind:

project_creation → create project scoped to account_id, link owner contact, assign role

flag_flow → same as YAML, but scoped by tenant

weekly_report_generation → scoped by tenant

schedule_quick_pick → enforce activity inclusion rule; scoped by tenant

All workflows must log AuditEvent and create NotificationEvent.

7. PWA Requirements

Manifest: generate with app name, short_name, theme_color, background_color, icons (maskable).

Service Worker: precache app shell; stale-while-revalidate for static assets; cache-first for images; network-first for API.

Install Prompt: show “Install Crewdex” button when app is not standalone.

Update flow: detect waiting Service Worker, show update prompt, reload on confirm.

Offline:

Cached reads work offline

Writes queued (IndexedDB/localStorage) and replayed on reconnect

Offline indicator in header

8. Responsive UI Rules

App Shell:

Sticky header (project context, install button, offline indicator)

Scrollable content below

Breakpoints:

Desktop (lg+): two columns (sidebar + content)

Tablet (md): stack or two columns depending on width

Phone (<md): single column with sticky header

Data Lists:

Use tables on desktop/tablet

Render as stacked cards on phone (ResponsiveList)

Schedule Page:

Quick-pick flow collapses vertically on small screens

Accessibility: keyboard navigable, WCAG AA contrast, reduced motion support

9. Billing Integration

Add Stripe stubs in API:

POST /billing/subscribe → create subscription (future)

POST /billing/webhook → receive Stripe events

Add Subscription entity as defined in YAML for in-app notifications, but keep billing separate.

Tenants must be linked to Stripe customer_id.

10. Notifications & Offline Queue

NotificationEvent from YAML is source of truth.

Offline queue schema: { method, url, headers, body, createdAt, retryCount }.

Flush queue when online; exponential backoff on failures.

User sees state of queued actions.

11. Developer Experience

Root scripts:

pnpm dev → run backend + frontend concurrently

pnpm build → build both

pnpm start → serve backend + built frontend

db:migrate, db:seed for schema mgmt

README must document PWA install, SaaS auth, and multi-tenant logic

12. Acceptance Criteria

✅ Multi-tenant isolation enforced (account_id scoping)

✅ RBAC works per tenant (AccountAdmin, ProjectOwner, etc.)

✅ PWA installable (desktop + mobile), Lighthouse score ≥ 90

✅ Works offline for cached reads, queues writes

✅ Responsive layout: desktop two-col, tablet adaptive, phone one-col

✅ Update prompt appears when new SW deployed

✅ Accessibility met (keyboard, color contrast, reduced motion)

13. Constraints

No external UI libraries outside React/Tailwind/shadcn

Bundle size lean; cache only essentials offline

No direct Supabase Auth/Storage unless explicitly chosen; DB is Postgres

Stripe integration is optional stub until production

End of AGENT.md
