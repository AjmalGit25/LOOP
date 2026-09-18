# LOOP

LOOP is an AI-powered customer feedback intelligence workspace for product, CX, and support teams. It ingests feedback, classifies sentiment and themes, visualizes trends, and helps teams answer real product questions from their own customer data.

## Product overview

LOOP helps teams turn raw customer feedback into signals they can act on:

- Ingest feedback from CSV or direct workspace flows
- Run AI classification for sentiment, themes, and issue summaries
- Manage feedback in a searchable inbox with RBAC
- View dashboard metrics and trend charts by channel and theme
- Generate saved reports for a time range and export them as PDF-friendly pages
- Ask plain-English questions grounded in the workspace evidence

## Demo credentials

The seed script creates demo users in a single workspace.

- Admin: admin@loop-demo.com
- Analyst: analyst@loop-demo.com
- Viewer: viewer@loop-demo.com
- Shared password: demo1234

## Tech stack

- Next.js 16 App Router
- React 19
- Prisma ORM with PostgreSQL
- NextAuth credentials auth
- Anthropic Claude for structured classification
- Recharts for dashboard visualizations
- Tailwind CSS for styling

## Architecture

### App shell

The application is organized around the Next.js app router:

- `app/` — route handlers, pages, and UI components
- `lib/` — shared domain logic, auth helpers, report generation, and Prisma wiring
- `prisma/` — schema and seed data
- `public/` — static assets

### Data model

The core data model is centered around workspaces, users, feedback, themes, and saved reports:

- `Workspace` groups users and all feedback assets
- `User` has a role: `ADMIN`, `ANALYST`, or `VIEWER`
- `Feedback` stores the original customer message, channel, status, and sentiment metadata
- `Theme` stores cluster labels for the workspace
- `FeedbackTheme` links feedback to clusters and confidence scores
- `Report` stores a generated summary with JSON content for later viewing/export

### AI flow

The AI classification pipeline is intentionally layered:

1. Feedback is entered through the inbox, import flow, or seed data.
2. The app calls Claude with a workspace-specific theme list.
3. Claude returns structured sentiment, theme names, and a short summary.
4. `persistClassification()` updates the feedback record and re-creates theme links.
5. Dashboard and trends views read the computed PostgreSQL data instead of generating synthetic metrics.

### Security model

Security is enforced at both the UI and API layers:

- Authentication is handled by NextAuth credentials auth.
- Session data includes workspace and role metadata.
- Every protected API route calls `requireAuth()` or `requireRole()`.
- Workspace-scoped Prisma queries enforce the tenant boundary.

## Local setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Anthropic API key

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="your-claude-api-key"
```

### 3) Generate Prisma client

```bash
npx prisma generate
```

### 4) Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5) Seed demo data

```bash
npm run seed
```

### 6) Start the app

```bash
npm run dev
```

Then open:

- http://localhost:3000

## Seed data

The seed script creates a realistic demo workspace and example customer feedback records. It is designed to surface meaningful mixes of:

- negative support issues
- feature requests and product feedback
- positive adoption stories
- pricing and onboarding pain points
- trend and channel-level signal diversity

The seed is defined in:

- `prisma/seed.ts`
- `lib/feedback-data.ts`

It also creates demo users and workspace themes so the dashboard, filters, and RBAC flows are immediately usable.

## Run and verify

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Start production server

```bash
npm run start
```

### Lint

```bash
npm run lint
```

## Screenshots

The app includes a modern dark dashboard with product intelligence workflows. Example captures from the running app:

![Landing page](docs/screenshots/landing.png)
![Login page](docs/screenshots/login.png)
![Dashboard overview](docs/screenshots/dashboard.png)
![Generated report](docs/screenshots/report.png)

## Deployment

### Vercel deployment

This app is ready to deploy to Vercel with the standard Next.js flow:

1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Configure the environment variables from `.env.example`.
4. Set the project root to the repository root.
5. Deploy.

Recommended environment variables for production:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="secure-production-secret"
NEXTAUTH_URL="https://your-domain.com"
AUTH_URL="https://your-domain.com"
ANTHROPIC_API_KEY="..."
```

### Production notes

- Use a managed PostgreSQL provider for the database.
- Keep `NEXTAUTH_SECRET` long and random.
- Ensure app URLs match the deployed domain exactly.
- Run database migrations in production before the first user login.

## Core user flows

### Admin and analyst flows

- Sign in with a workspace account
- Review the overview metrics and weekly volume
- Browse feedback and filter by sentiment, channel, or theme
- Import CSV files for bulk ingestion
- Generate saved reports for executive sharing

### Viewer flow

- Read-only access to the workspace
- Browse feedback and dashboard summaries
- View report pages without editing permissions

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
