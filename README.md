# Crewdex

Crewdex is a multi-tenant SaaS Progressive Web App (PWA) for project workflows.

## Running the App

Install dependencies and start both backend and frontend with:

```bash
pnpm install
pnpm dev
```

The `pnpm dev` script launches the backend API and the frontend client concurrently.

## User Registration

New accounts are created through the registration endpoint. Send a `POST` request to `/auth/register` with:

```json
{
  "account_name": "My Company",
  "email": "admin@example.com",
  "password": "plain-text password"
}
```

The server creates the account, stores a bcrypt password hash, and responds with a session token (JWT) in an HTTP-only cookie.

## Authentication and RBAC

Users authenticate with email, password, and a project ID. Passwords are stored as hashes and verified using `bcrypt.compare`. Successful login issues a JWT containing:

- `account_id`
- `project_contact_id`
- `role`

The login request must include the following JSON body:

```json
{
  "email": "user@example.com",
  "password": "plain-text password",
  "project_id": "project identifier"
}
```

The `project_id` ensures the session is scoped to the selected project.

Role-based access control (RBAC) is enforced on every route. Supported roles include:

- **AccountAdmin** – manage account-wide settings and billing
- **ProjectOwner** – full control over projects they own
- **ProjectAdmin** – manage project data without billing access
- **Viewer** – read-only access to shared resources

## Tenant Isolation

Every database record includes an `account_id`. All queries filter by this value so data from one account cannot be accessed by another tenant.

## PWA Installation and Offline Use

To install the app:

1. Open Crewdex in a supported browser (Chrome, Edge, Safari).
2. Use the browser's **Install** or **Add to Home Screen** option.
3. Launch Crewdex from the installed app icon.

Once installed, Crewdex works offline:

- Previously viewed data is served from cache.
- Failed `POST`/`PUT` requests are stored in IndexedDB and retried when
  connectivity returns.
- The header displays an offline badge and the number of queued requests.
- Update prompts appear when a new version is available.
- Queued requests retry with exponential backoff (`2^retryCount` seconds)
  and are skipped until their scheduled retry time.

