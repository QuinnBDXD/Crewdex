# Crewdex — Field‑First Project Directory (README + Spec, aligned v1.0.3)

*Last updated: 2025‑08‑16*

A **field‑first** web app that makes the project directory the home for supers. Minimal inputs; the work they already do (marking subs on site, noting what they’re working on) auto‑fills reporting. **No timers.** Cards reset at **00:00** (project time zone). The directory is grouped by **domains**: Admin, Subcontractors, Suppliers, Engineering/Architecture, and AHJ. Admin shows **job titles**; other domains show **service/material** as the role.

---

## Primary Jobs‑To‑Be‑Done

- **Find people fast** (call, text, email, flag)
- **Mark On Site** with **crew size + activity** (quick‑pick from assigned scope tags)
- **Draft Daily Report** prefilled from **today’s roster**; supers enter hours + submit
- **Jump** to Plans, Files, Schedule, Reports

---

## Developer Setup

### Prerequisites

- Node.js (LTS)
- PNPM
- Postgres

### Getting Started

```bash
pnpm install
cp .env.example .env   # fill POSTGRES_URL, WEATHER_API_KEY (optional)
pnpm db:migrate        # run SQL in /db/migrations
pnpm build
pnpm dev
```

### Tech Stack

- **Client:** React + Tailwind + shadcn/ui; PWA with offline support
- **State:** TanStack Query (server cache) + Zustand (UI state)
- **Local:** Dexie for queued offline writes; last‑write‑wins on sync
- **Server:** Node/Express (or Fastify) with tRPC (or REST)
- **DB:** Postgres (+ Drizzle or Prisma)
- **Time:** All “daily” logic anchored to **project time zone**

### Operational Rules

- Deterministic nightly reset at **00:00** (project tz)
- Offline writes queue and retry; server is source of truth; **audit all writes**
- Presence is **one row per contact per day** (update crew/activity in place)

---
# .env (example)
DATABASE_URL="postgresql://user:pass@localhost:5432/crewdex"
JWT_SECRET="dev-super-secret"
OTP_EMAIL_FROM="no-reply@crewdex.local"
STORAGE_BUCKET="crewdex-attachments"      # (if using S3/Supabase Storage)
S3_ENDPOINT="http://127.0.0.1:9000"       # optional
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
PROJECT_TZ_DEFAULT="America/New_York"

## Data Model (Aligned)

> Alignment highlights:
>
> - `contacts.domain` uses a **Postgres ENUM** `domain` (not `TEXT CHECK`).
> - Added canonical \`\` table.
> - Kept `audit_log` for traceability.

```sql
-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  client_name TEXT,
  tz TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- optional companies (for Users)
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

-- users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company_id UUID REFERENCES companies(id)
);

-- domain enum
CREATE TYPE domain AS ENUM (
  'Admin','Subcontractors','Suppliers','Engineering/Architecture','AHJ'
);

-- directory contacts (per project)
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  domain domain NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,         -- Admin only
  service TEXT,      -- Non‑admin
  phone TEXT,
  email TEXT,
  scope_tags TEXT[] DEFAULT '{}',   -- all available scopes for quick picks
  scope_top  TEXT[] DEFAULT '{}',   -- top chips shown first
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- per‑day roster (resets every day)
CREATE TABLE daily_presence (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  date DATE NOT NULL,                  -- project local date
  crew_size INT NOT NULL CHECK (crew_size > 0),
  activity TEXT NOT NULL,              -- from scope tag or custom text
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, contact_id, date)
);

-- daily report (prefills from presence; hours provided by super)
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ
);

-- report lines
CREATE TABLE daily_report_lines (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  service TEXT,
  crew_size INT,
  activity TEXT,
  hours NUMERIC(4,1),
  notes TEXT
);

-- flags (MVP‑lite)
CREATE TABLE flags (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  date DATE NOT NULL,                                 -- project local date
  type TEXT NOT NULL CHECK (type IN ('lagging','quality','praise')),
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  project_id UUID,
  actor_id UUID,
  event TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Surface (tRPC shapes or REST)

> Alignment fixes:
>
> - **Flags path** unified to `POST /projects/:id/flags` with canonical payload.
> - **Scope‑tag editing** normalized to `PATCH /contacts/:id/scope-tags`.
> - **Weather** route listed as cached utility (optional if no API key).

### Contacts

```http
GET    /projects/:id/contacts?domain=Subcontractors
POST   /projects/:id/contacts            # { name, domain, role/service, phone, email, scope_tags }
PATCH  /contacts/:id                     # mutate fields
PATCH  /contacts/:id/scope-tags          # { add?: string[], remove?: string[], top?: string[] }
```

### Presence & Daily

```http
POST   /projects/:id/presence/mark       # { contactId, date, crewSize, activity }
DELETE /projects/:id/presence/mark       # { contactId, date }
GET    /projects/:id/presence?date=YYYY-MM-DD
```

### Daily Reports

```http
POST   /projects/:id/reports/daily                 # body: { date }
GET    /projects/:id/reports/daily?date=YYYY-MM-DD
PATCH  /reports/:id/line/:lineId                   # set hours, notes
POST   /reports/:id/submit                         # lock & audit
```

### Flags (MVP‑lite)

```http
POST   /projects/:id/flags
Content-Type: application/json

{
  "contactId": "uuid",
  "date": "YYYY-MM-DD",
  "type": "lagging" | "quality" | "praise",
  "description": "text"
}
```

*Response:* `{ "success": true, "id": "uuid" }`

### Utilities

```http
GET    /projects/:id/weather   # server caches provider response (optional)
```

---

## MVP Acceptance Criteria

### 1) Auth + Project Switcher

- Email/OTP login
- User can switch between projects via `/projects/:id`
- RBAC enforced: Super, PM, Contract Admin, Client Rep, Viewer

### 2) Directory CRUD + Domains + Scope Assignments

- API endpoints above implemented
- Contacts grouped by domain; collapsible sections in UI
- Contact card actions: **Call**, **Text**, **Email**, **Flag** (single entry point)
- Scope tags appear as quick‑pick chips on **Mark On Site** modal

**Done when:** A PM can add/edit contacts; grouping renders; scope tags power quick‑picks.

### 3) Mark On Site

- Modal with numeric crew input + activity chips (from `contacts.scope_tags`) and free‑text
- Writes to `daily_presence`; **one row per contact/day**
- Offline first (Dexie queue → sync)

**Done when:** Contact shows badge “On Site · {crew} · {activity}” for today; persists across refresh/offline.

### 3.1) Report Issue (Flags)

- Three chips (Lagging, Quality, Praise) + required description
- Persists to `flags`; writes `audit_log`
- Offline first (Dexie queue → sync)

**Done when:** Super can submit a flag from any contact card and retrieve later via API/DB.

### 4) Daily Reports

- Prefill lines from presence; super sets hours and notes
- Submit locks report and audits

**Done when:** Status transitions to `submitted` and is immutable via UI.

### 5) Offline + Daily Reset

- Dexie queue for presence/flags/report‑line writes
- Retry on reconnect; last‑write‑wins
- Server job resets roster at **00:00** per project tz

### 6) Utilities

- Weather endpoint (optional) documented and cached if enabled

---

## Good to Have → v1.1

- Flags board (list/filter/resolve/close)
- CSV import for contacts
- PDF export of daily report
- Theming surface/docs 

---

## Notes

- Validate inputs with **Zod** on server (shareable on client where helpful)
- Target <100ms interactions on a modern phone
- Accessibility required (focus states, ARIA labels, keyboard shortcuts)

