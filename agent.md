# Crewdex Engineering Agent

A single file you can drop into your repo or workspace to steer an AI code assistant (Cursor / ChatGPT / Claude / GitHub Copilot Agents) to work on Crewdex consistently.

---

## 1) Purpose

- Ship small, reviewable PRs that move Crewdex forward without breaking local dev.
- Keep UI consistent with our design system (Tailwind + shadcn/ui + lucide-react; clean, minimal, modern).
- Be explicit: every task includes scope, acceptance criteria, files to touch, and non‑goals.

## 2) Repo Snapshot (aligned to v1.0.3 spec)

- **Frontend:** React + Vite + TypeScript, Tailwind, shadcn/ui, lucide-react.
- **State:** TanStack Query + Zustand for UI state.
- **Local offline:** Dexie for queued offline writes; last‑write‑wins on sync.
- **Backend:** Node/Express (or Fastify) with REST/tRPC under `/api/*`.
- **Database:** Postgres (Drizzle/Prisma or Supabase equivalent).
- **Package manager:** `pnpm`.
- **Dev scripts:**
  - `pnpm install`
  - `pnpm dev` (frontend `:5173`, backend `:3001` via proxy)
  - `pnpm db:migrate` (SQL in `/db/migrations`)
  - `pnpm build` then `node server/index.js`
- **Docker (optional):** `docker build -t crewdex .` → `docker run -p 3000:3000 crewdex`.

> If something differs in your repo, agent should read `package.json` and adjust automatically.

## 3) Guardrails & Constraints

- **Do not** add dependencies unless necessary; prefer in‑repo utilities.
- **Never** hardcode secrets; `.env.example` semantics are source of truth.
- Schema/migration changes only when task explicitly requests.
- PRs < 300 LOC when possible.
- Composition > prop drilling; use small components + hooks.
- a11y required: labels, aria‑attrs, keyboard focus, contrast.
- Use **Conventional Commits.**

## 4) UI System Rules

- Tailwind for layout/spacing/typography. Rounded corners `rounded-2xl`, soft shadows.
- shadcn/ui for primitives: Button, Card, Input, Dialog, Dropdown, Sheet, Tabs.
- lucide-react for icons.
- Recharts for charts if needed.
- Framer Motion for subtle fades/slide‑ins only.
- Grid-first layouts; min padding `p-2`. Responsive by default.

## 5) Local Dev Runbook

```bash
corepack enable
pnpm -v || npm i -g pnpm
pnpm install

pnpm dev            # vite :5173, API :3001
pnpm dev:backend    # backend only

pnpm db:migrate     # run SQL migrations in /db/migrations

pnpm build
node server/index.js
```

**Common Issues**

- ``**:** install pnpm or `corepack enable`.
- **Docker 500 ping (Windows):** restart Docker Desktop; ensure Linux Engine; `wsl --shutdown`.

## 6) Env Template

```
# .env (example)
POSTGRES_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"  # or Supabase DATABASE_URL
JWT_SECRET="dev-super-secret"
OTP_EMAIL_FROM="no-reply@crewdex.local"
PROJECT_TZ_DEFAULT="America/New_York"

# Storage (Supabase or S3)
STORAGE_BUCKET="crewdex-attachments"
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service role key>"
SUPABASE_JWT_SECRET="<jwt secret>"
```

## 7) Task Template

```
ROLE: You are the Crewdex Engineering Agent working in this repository.

TASK: <single, concrete change>

CONTEXT:
- Target files: <paths>
- Non-goals: <out-of-scope>
- Acceptance criteria: 1)…2)…3)…
- Tests/manual checks: build passes, dev runs, no console errors

STYLE:
- Tailwind + shadcn/ui + lucide-react. Rounded-2xl, soft shadow, grid layout.
- Small composable components. Add JSDoc for public hooks.

OUTPUT:
- Provide a unified diff and any new files.
- Include Conventional Commit message.
- Add short manual test plan.
```

## 8) Examples

- **Sticky Project Card + Scrollable Domains** (UI).
- **Themes Expansion** (add Tailwind-aligned palettes).
- **Supabase Integration** (client in `src/lib/supabase.ts`, RLS-aware policies, offline queue sync).

## 9) Patch / Diff Workflow

```bash
git checkout -b feat/patch
git apply --3way patch.diff
pnpm build && pnpm dev

# create patch
git add -A
git commit -m "feat(ui): sticky project card"
git format-patch -1 HEAD -o patches/
```

## 10) Commit & PR Standards

- Conventional Commits (`feat:`, `fix:`, etc).
- Title ≤ 72 chars; body explains rationale; link issue.
- Include Test Plan: steps, validations, edge cases.

## 11) Testing & Quality Gates

- `pnpm lint`, `pnpm typecheck`, build passes.
- No console errors.
- Accessibility pass: Tab navigation, labels, contrast.

## 12) Backend Conventions

- Express/Fastify routers under `/server/routes/*`.
- Async/await + try/catch. Map errors to HTTP codes.
- Input validation with Zod (preferred).
- No breaking API changes without migration plan.

## 13) Docs Maintenance

- Update `README.md` and `agent.md` on changes.
- Update architecture diagrams if present.

## 14) Infra Notes

- Dockerfile must serve built frontend + API.
- Healthcheck endpoint: `/api/health` → 200 OK.
- Nightly reset job at 12:01 AM project tz.

## 15) Troubleshooting Appendix

- Docker `_ping` errors → restart Docker Desktop, check WSL.
- Proxy: frontend :5173, backend :3001.
- Missing pnpm → `npm i -g pnpm` or `corepack enable`.

## 16) Prompts You Can Paste To Your Agent

**System:**

```
You are the Crewdex Engineering Agent. Use Tailwind + shadcn/ui + lucide-react. Work in small diffs. Follow Conventional Commits. Provide unified diff + short test plan. Do not invent files. Propose plan before schema/API changes.
```

**Developer:**

```
Project uses Vite + React + TypeScript, Express backend, Postgres/Supabase. pnpm for deps. Clean UI, rounded-2xl, soft shadows. Components small and composable. No heavy deps.
```

**User (example):**

```
Task: Make top project card sticky and domains scrollable, responsive to phone/tablet.
Paths: src/pages/ProjectPage.tsx, src/components/ProjectCard.tsx, src/styles/globals.css
Acceptance: sticky header, overflow auto list, no layout shift, build passes.
Output: unified diff + commit msg + test plan.
```

## 17) Sub‑Agents

- **UI Agent:** React/Tailwind/shadcn, accessibility, themes.
- **Backend Agent:** Express/tRPC, validation, error handling.
- **Docs Agent:** Keep README + agent.md aligned.

---

**License & Ownership** This file is project-internal guidance for using AI with Crewdex. Modify freely.

