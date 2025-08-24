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

Error response shape must be consistent: