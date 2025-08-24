# Crewdex

Crewdex is a multi-tenant SaaS Progressive Web App (PWA) for project workflows.

## Running the App

Install dependencies and start both backend and frontend with:

```bash
pnpm install
pnpm dev
```

The `pnpm dev` script launches the backend API and the frontend client concurrently.

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

Once the service worker and caching are implemented, Crewdex will support:

- Offline access to previously viewed data.
- Queued writes that sync when connectivity returns.
- An offline indicator and update prompts when a new version is available.

