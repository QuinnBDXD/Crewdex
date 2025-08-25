# Crewdex Frontend

The frontend is a React application built with Vite and configured as a Progressive Web App (PWA).

## Setup

1. Install workspace dependencies:
   
   ```bash
   pnpm install
   ```

2. Start the development servers:
   
   ```bash
   pnpm dev
   ```
   
   This command runs both the backend API and the frontend client. To launch only the frontend, run:
   
   ```bash
   pnpm --filter frontend dev
   ```

3. Build the frontend for production:
   
   ```bash
   pnpm --filter frontend build
   ```

## Authentication & Multi-Tenancy

Crewdex uses JSON Web Tokens to authenticate users and scope data to each account. Every session token embeds `account_id`, `project_contact_id`, and `role` so the UI only shows data for the current tenant.

## PWA Installation

Crewdex can be installed on desktop and mobile:

1. Open the app in a supported browser.
2. Click the **Install Crewdex** button in the header or choose the browser's **Install / Add to Home Screen** option.
3. Launch Crewdex from the installed icon. When a new version is available, the service worker prompts for an update.

## Offline Behavior

- The service worker caches the application shell and previously visited pages.
- Requests made while offline are queued in IndexedDB and retried automatically when connectivity returns.
- Network errors show an offline badge in the header along with the number of queued actions.
