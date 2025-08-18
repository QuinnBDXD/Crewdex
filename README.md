# Crewdex — Field‑First Project Directory (README + Spec, aligned v1.0.3)

*Last updated: 2025‑08‑16*

A **field‑first** web app that makes the project directory the home for supers. Minimal inputs; the work they already do (marking subs on site, noting what they’re working on) auto‑fills reporting. **No timers.** Cards reset at **00:00** (project time zone). The directory is grouped by **domains**: Admin, Subcontractors, Suppliers, Engineering/Architecture, and AHJ. Admin shows **job titles**; other domains show **service/material** as the role.

---

## Primary Jobs‑To‑Be‑Done

- **Find people fast** (call, text, email, flag)
- **Mark On Site** with **crew size + activity** (quick‑pick from assigned scope tags)
- **Draft Daily Report** prefilled from **today’s roster**; supers enter hours + submit
- **Jump** to Plans, Files, Schedule, Reports


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




