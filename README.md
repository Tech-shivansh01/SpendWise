# SpendWise

SpendWise is a full-stack, AI-integrated expense tracker designed as a polished student resume project. It helps users record expenses, understand spending patterns, and generate personalized summaries across weekly, monthly, and quarterly periods.

## Features

- Manual expense entry with category, amount, date, and notes
- Full expense CRUD: create, view, edit, and delete
- Search, filtering, and sorting by date, amount, and category
- Dashboard statistics for total spend, average transaction, and top category
- Interactive Recharts visualizations:
  - Spending by category
  - Category totals
  - Spending trends over time
  - Category breakdowns
- AI-powered personalized spending insights
- AI summaries for:
  - 1 week
  - 1 month
  - 3 months
- USD and INR display toggle
- Dark/light theme toggle
- Category emojis for faster visual recognition
- Responsive layout for desktop, tablet, and mobile
- Manus OAuth authentication

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Express 4
- tRPC 11
- Drizzle ORM
- MySQL-compatible database via `mysql2`
- Recharts
- Manus OAuth
- Manus built-in LLM and platform APIs
- pnpm

## Project Structure

```text
client/       React frontend, pages, contexts, and UI components
server/       Express server, tRPC routers, auth, database, and AI integrations
drizzle/      MySQL schema and migrations
shared/       Shared types and constants
references/   Integration notes for Manus services
```

## Local Development

### Requirements

- Node.js 22 or newer
- pnpm 10 or newer
- A MySQL-compatible database if using authenticated and persistent features
- Manus environment variables, or equivalent credentials for an external deployment

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Create a local `.env` file and fill in the required values listed below. The `.env` file is ignored by Git.

Never commit `.env` or any file containing credentials.

### Run the development server

```bash
pnpm dev
```

The app runs on port `3000` by default.

## Environment Variables

Server-side variables:

- `DATABASE_URL` - MySQL-compatible database connection string
- `JWT_SECRET` - Secret used to sign session cookies
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth service URL
- `OWNER_OPEN_ID` - Owner identity used for admin role assignment
- `BUILT_IN_FORGE_API_URL` - Manus built-in API base URL for AI and platform services
- `BUILT_IN_FORGE_API_KEY` - Server-side Manus built-in API key

Frontend build variables:

- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL
- `VITE_APP_ID` - OAuth application ID exposed to the frontend
- `VITE_FRONTEND_FORGE_API_URL` - Frontend-safe Manus API base URL when maps or other browser APIs are enabled
- `VITE_FRONTEND_FORGE_API_KEY` - Frontend-safe API key, if required by the selected integration
- `VITE_ANALYTICS_ENDPOINT` - Optional analytics endpoint
- `VITE_ANALYTICS_WEBSITE_ID` - Optional analytics website ID

Do not place server-only secrets in variables prefixed with `VITE_`; Vite exposes `VITE_` variables to the browser.

## Database

SpendWise currently uses a **MySQL-compatible database** with Drizzle ORM. The schema is defined in `drizzle/schema.ts` and includes:

- `users` - authenticated user profiles
- `expenses` - individual expense records stored in USD as the base currency
- `summaries` - generated AI summaries and period metadata

Generate and apply migrations with:

```bash
pnpm db:push
```

For an external deployment, use a managed MySQL-compatible database and set its connection string as `DATABASE_URL`. A PostgreSQL database is not drop-in compatible with the current schema and would require a separate migration to Drizzle's PostgreSQL adapter.

## Scripts

```bash
pnpm dev       # Start the development server
pnpm build     # Build the Vite frontend and production server
pnpm start     # Start the production server from dist/
pnpm check     # Run TypeScript checks
pnpm test      # Run Vitest tests
pnpm db:push   # Generate and apply Drizzle migrations
```

## Production Deployment Notes

The current application is a single Express/tRPC server that serves the built frontend and backend routes together. It can be hosted as one service on a Node-compatible platform such as Render.

A split deployment can also be used:

- Vercel hosts the Vite frontend
- Render hosts the Express/tRPC backend
- A managed MySQL-compatible database is shared by the Render backend

A split deployment requires configuring the frontend API base URL, backend CORS and cookie settings, OAuth redirect URLs, and the required environment variables on each provider. Deployment-specific configuration should be added only after the target GitHub repository and production domains are known.

## Security Checklist

Do not commit:

- `.env` files or API keys
- Database passwords or connection strings containing credentials
- `node_modules/`
- `dist/` or other build output
- Runtime logs
- Manus project metadata or checkpoint files
- Personal browser/session data

The repository `.gitignore` is configured to exclude the main categories above. Always inspect `git diff --cached` before pushing.

## Testing

The repository includes Vitest tests for the authentication flow. Before pushing changes, run:

```bash
pnpm test
pnpm check
pnpm build
```

## License

This project is available under the MIT License.
