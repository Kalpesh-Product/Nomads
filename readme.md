# Nomads

Developer documentation for **Nomads** — the public WONO platform for digital nomads and the companies that host them.

The repository is a two-app monorepo: a React single-page application in `frontend/` and an Express/MongoDB API in `backend/`. A Docusaurus site in `docs-site/` holds the end-user guide that ships with the frontend build, and `docs/` holds internal engineering notes.

| Documentation | Audience |
| ------------- | -------- |
| This file | Developers working on the Nomads codebase |
| [`docs-site/`](docs-site) | End users (published under `/docs/`) |
| [`docs/`](docs) | Engineering notes for individual features |

## Table of contents

- [What Nomads does](#what-nomads-does)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [API overview](#api-overview)
- [How the main flows fit together](#how-the-main-flows-fit-together)
- [Integrations](#integrations)
- [User documentation site](#user-documentation-site)
- [Tests and checks](#tests-and-checks)
- [Deployment](#deployment)
- [Working in this repository](#working-in-this-repository)
- [Troubleshooting](#troubleshooting)

## What Nomads does

- **Discover destinations** — listings, places, restaurants, events, blogs and news, global listings map and list views, world ranking, visa rules and workation content.
- **AI Nomad** — an AI-assisted search experience (`frontend/src/pages/Ai*.jsx`) alongside the classic search flows.
- **Host and company sites** — company profile pages plus generated template websites (`frontend/src/pages/company/`) that pull their content and theme from the Master Panel website builder.
- **Host onboarding** — B2B/B2C lead forms, plans and pricing, conversations routed to the Host Panel.
- **Contributor program** — nomads request contributor roles (blogger, news writer, place writer, event writer); approved contributors publish content through the contribution dashboard.
- **Accounts** — JWT access tokens with refresh cookies, profile management, saved favourites and password reset by OTP.

## Repository layout

```text
Nomads/
  backend/                  Express API (ES modules)
    server.js               Entrypoint: middleware, route mounts, DB connect, listen
    routes/                 Route modules grouped by domain (39 files)
    controllers/            Request handlers and business logic
    models/                 Mongoose schemas
    config/                 db, CORS, mailer, multer, S3
    middlewares/            verifyJwt, verifyAdminApiKey, contributorAccess, credentials, errorHandler
    utils/                  Shared helpers (plan pricing, contributor lifecycle, listing status, email templates)
    tests/                  node:test suites
    scripts/                Maintenance scripts
  frontend/                 React 19 + Vite SPA
    src/pages/              Route-level pages (classic and Ai-prefixed variants, company templates, host flows)
    src/components/         Shared UI
    src/hooks/              Data and auth hooks
    src/redux/              Redux Toolkit store and slices
    src/context/            Auth and sidebar context
    middleware.js           Vercel edge middleware (Open Graph tags for link crawlers)
    tests/                  node:test suites
  docs-site/                Docusaurus user guide (built into frontend/dist/docs)
  docs/                     Internal engineering notes
  .github/workflows/        EC2 deployment workflow
```

Backend domains follow a **route → controller → model** shape, with cross-cutting behaviour in `middlewares/` and `utils/`.

## Tech stack

**Backend**

| Technology | Use |
| ---------- | --- |
| Node.js (ES modules) | Runtime |
| Express 5 | HTTP framework |
| MongoDB + Mongoose 8 | Persistence |
| JSON Web Tokens + cookie-parser | Auth (bearer access token, refresh cookie) |
| Multer + Sharp | Uploads and image resizing |
| AWS SDK v3 (S3) | Object storage |
| Nodemailer | Transactional email |
| Axios | Outbound calls to Master Panel and external APIs |
| ExcelJS, csv-parser | Bulk import/export |
| libphonenumber-js, Yup | Validation |

**Frontend**

| Technology | Use |
| ---------- | --- |
| React 19 + Vite 6 | Application and build tooling |
| React Router 7 | Routing |
| Redux Toolkit + Redux Persist | Global state |
| TanStack React Query | Server-state fetching |
| Tailwind CSS, MUI 6, Headless UI, lucide-react, react-icons | Styling and icons |
| Google Maps (`@react-google-maps/api`), react-three-fiber | Map and 3D content |
| Formik-free forms with react-hook-form, SweetAlert2, Sonner, react-hot-toast | Forms and feedback |

## Prerequisites

- Node.js 20 or newer (both apps and the docs site)
- npm
- A MongoDB connection string
- Backend `.env` values for the integrations you intend to exercise
- AWS S3 credentials for upload flows
- Google Maps/Places API keys for map, place and review flows

## Getting started

Install each app separately (there is no workspace-level `package.json`):

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../docs-site
npm install
```

Run the API and the client in separate terminals:

```bash
# Terminal 1 — API on http://localhost:3000
cd backend
npm run dev

# Terminal 2 — SPA on http://localhost:5173
cd frontend
npm run dev
```

The backend only starts listening after MongoDB connects, so a blank terminal or an immediate exit almost always means `MONGO_URL` is missing or unreachable.

## Environment variables

Create `backend/.env` and `frontend/.env`. Never commit real secrets.

**Backend**

```env
PORT=3000
MONGO_URL=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
PASSWORD_RESET_OTP_SECRET=
ADMIN_API_KEY=

FRONTEND_DEV_LINK=http://localhost:5173/
FRONTEND_PROD_LINK=
NOMADS_FRONTEND_URL=http://localhost:5173

PROJECT_AWS_REGION=
PROJECT_AWS_ACCESS_KEY=
PROJECT_AWS_SECRET_KEY=
PROJECT_S3_BUCKET_NAME=

EMAIL_USER=
EMAIL_PASS=

GOOGLE_PLACES_API_KEY=
MASTERPANEL_API_BASE_URL=http://localhost:5007/api
WONOMASTER_BE=http://localhost:5007
HOST_PANEL_BE=https://hostpanel.wono.co

B2B_APPS_SCRIPT_URL=
B2C_APPS_SCRIPT_URL=
FORCE_GOOGLE_DNS=false
```

`FORCE_GOOGLE_DNS=true` points Node's resolver at `8.8.8.8`/`8.8.4.4`; it is a local-development escape hatch for networks with broken DNS.

**Frontend**

```env
VITE_GOOGLE_API_KEY=
VITE_GOOGLE_MAPS_API_KEY=
VITE_MASTER_PANEL_BE_URL=http://localhost:5007
VITE_AI_SCORE_RANGE_MIN=

# Used by the production build and the deploy workflow
VITE_PROD_LINK=
VITE_DEV_LINK=
VITE_HOST_PANEL_URL=
```

`ADMIN_API_KEY` must match `NOMADS_ADMIN_API_KEY` in the Master Panel. The deploy workflow writes `VITE_PROD_LINK`, `VITE_DEV_LINK`, `VITE_GOOGLE_API_KEY`, `VITE_MASTER_PANEL_BE_URL` and `VITE_HOST_PANEL_URL`, so those names are the ones to keep in CI secrets.

Some flows also reference fixed production URLs (for example the Host Panel and Master Panel base URLs); check the page or controller before assuming an integration can be pointed at a local service.

## npm scripts

**Backend**

| Script | Command | Notes |
| ------ | ------- | ----- |
| `npm start` | `node --tls-min-v1.2 server.js` | Production entrypoint |
| `npm run dev` | `nodemon --exec "node --tls-min-v1.2" server.js` | Local development |
| `npm run backfill:event-reviews` | `node scripts/backfillEventReviewDetails.js` | One-off data backfill |
| `npm test` | placeholder | Exits with an error; run the suites in `backend/tests` directly |

**Frontend**

| Script | Command |
| ------ | ------- |
| `npm run dev` | Vite dev server (`0.0.0.0:5173`) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

**Docs site**

| Script | Command |
| ------ | ------- |
| `npm start` | Docusaurus dev server |
| `npm run build` | Static build to `build/` |
| `npm run serve` | Serve the built site |
| `npm run typecheck` | TypeScript check |

## API overview

All routes are mounted under `/api` in `backend/server.js`.

| Prefix | Purpose |
| ------ | ------- |
| `/api/auth` | Login, refresh, logout, password reset |
| `/api/user` | Signed-in nomad profile, roles, favourites, contributions (**JWT**) |
| `/api/company` | Company and listing data, uploads, host onboarding |
| `/api/poc`, `/api/review` | Points of contact and reviews |
| `/api/forms` | Public lead forms, plan pricing proxy |
| `/api/job` | Careers listings and applications |
| `/api/world-ranking`, `/api/state-wise-weight`, `/api/state-wise-weight-v2` | Ranking data and weights |
| `/api/visa-support`, `/api/visa-rules`, `/api/visa-rules-v2` | Visa content |
| `/api/consultation`, `/api/consultation-support` | Consultation funnels |
| `/api/company-setup-support`, `/api/activation-support`, `/api/workation-support`, `/api/overall-activation-support`, `/api/new-company-setup`, `/api/workation` | Service request funnels |
| `/api/become-contributor` | Contributor leads and role requests |
| `/api/editor` | Website template/editor data shared with the Master Panel |
| `/api/leads`, `/api/special-access`, `/api/analytics` | Leads, access lists, analytics |
| `/api/admin/nomad-users` | Internal user export (**`x-admin-api-key`**) |
| `/api/admin/verification-requests` | Verification leads and payment confirmation (**`x-admin-api-key`**) |
| `/api/admin/verify-business-clicks` | Business verification click data (**`x-admin-api-key`**) |
| `/api/news`, `/api/blogs`, `/api/events`, `/api/places`, `/api/restaurants` | Content |
| `/api/restaurant-reviews`, `/api/restaurantreviews`, `/api/restaurantpocs`, `/api/restaurant-pocs` | Restaurant reviews and POCs (two spellings are kept for backwards compatibility) |
| `/api/event-reviews`, `/api/place-reviews`, `/api/content-comments` | Event/place reviews and comments |

**Authentication and errors**

- `verifyJwt` guards `/api/user` and expects `Authorization: Bearer <accessToken>`.
- `verifyAdminApiKey` guards the `/api/admin/*` routes and expects the `x-admin-api-key` header.
- Unknown routes return 404 as HTML, JSON or plain text depending on the request's `Accept` header.
- Multer `LIMIT_FILE_SIZE` and oversized JSON bodies return `413` with a readable message; everything else falls through to the shared error handler.

## How the main flows fit together

**Authentication** — `POST /api/auth/login` returns an access token (kept by the client) and sets a refresh cookie; `GET /api/auth/refresh` rotates it. CORS is credentialed and cookie parsing is enabled globally, so the frontend origin must be listed in `backend/config/corsConfig.js`. Frontend helpers live in `frontend/src/hooks/` and `frontend/src/context/AuthContext.jsx`.

**Contributors** — submitting the contributor form creates a lead; it does not grant roles. Accounts start with all four contributor flags `false`, and the Master Panel approves or revokes each role through its authenticated proxy. Full detail, including the activation email, is in [`docs/contributor-approval.md`](docs/contributor-approval.md); the user-facing version is in [`docs-site/docs/become-a-contributor/`](docs-site/docs/become-a-contributor) and [`docs-site/docs/contributing/`](docs-site/docs/contributing).

**Listings and hosts** — listing content, verification state and plan/pricing live in the Master Panel. Nomads reads live Professional and Basic pricing through `/api/forms/plan-pricing` (which proxies the Master Panel) and checks listing status with `backend/utils/nomadListingStatus.js` rather than duplicating host state.

**Content moderation** — blogs, news, events, places and restaurant submissions are reviewed in the Master Panel. Review actions recorded here store the actor as `Master Panel` so the audit trail stays readable.

## Integrations

| Integration | Direction | Where |
| ----------- | --------- | ----- |
| Master Panel (`WoNoMasterPanel`) | Nomads → Master Panel | Plan pricing proxy (`backend/utils/planPricing.js`), listing status (`backend/utils/nomadListingStatus.js`), logo sync, POC sync, recruitment applications |
| Master Panel | Master Panel → Nomads | Contributor lead proxy, nomad user export, verification requests and Stripe payment confirmation, all under `/api/admin/*` with the admin API key |
| Host Panel | Nomads → Host Panel | Host onboarding and account flows (`HOST_PANEL_BE`, `backend/utils/hostPanelAccounts.js`) |
| AWS S3 | Outbound | Image and document storage (`backend/config/s3Config.js`) |
| Google Places/Maps | Outbound | Place lookup and map rendering |
| Nodemailer | Outbound | Account, contributor and lead notifications |
| Google Apps Script | Outbound | B2B/B2C sheet handoff |

Because the Master Panel is the source of truth for plans, pricing and host state, failures there must not break public pages — the pricing and listing helpers swallow upstream errors and fall back to defaults. Keep that behaviour when changing them.

## User documentation site

`docs-site/` is a Docusaurus 3 site containing the end-user Nomads guide (getting started, account, discovery, destinations, contributing, help). Edit Markdown under `docs-site/docs/`; the sidebar is driven by folder metadata and each page's `sidebar_position`.

```bash
cd docs-site
npm start          # default port 3000 clashes with the API — use: npm start -- --port 3100
npm run build
npm run serve
```

The deploy workflow builds the site and copies `build/` into `frontend/dist/docs/`, so the guide is served from the same origin as the SPA. The web server should serve directory indexes under `/docs/` and return the docs 404 for missing pages instead of falling back to the SPA:

```nginx
location ^~ /docs/ {
    index index.html;
    try_files $uri $uri/ =404;
    error_page 404 /docs/404.html;
}
```

## Tests and checks

- `frontend`: `npm run lint` before shipping frontend changes, plus `npm run build` to catch bundling errors.
- `backend`: `npm test` is a placeholder. Test suites live in `backend/tests/` (`blogDeletion`, `contentComments`, `contentFavorites`, `contributionLifecycle`, `contributorActivationEmail`, `contributorApproval`) and run with Node's built-in runner, for example:

  ```bash
  cd backend
  node --test tests/contributorApproval.test.js
  ```

- `frontend/tests/` holds the matching client-side suite (`contributionFavorites.test.js`).
- For backend changes without a focused suite, exercise the affected endpoint manually; there is no integration harness.

## Deployment

Two paths exist:

**GitHub Actions → EC2** (`.github/workflows/deploy.yml`, manual `workflow_dispatch`)

1. Installs and builds `frontend` with secrets written to `.env`.
2. Builds `docs-site` and copies it into `frontend/dist/docs`.
3. rsyncs `frontend/dist/` to `/home/ubuntu/apps/Nomads/frontend/dist/`.
4. On the server: `git pull origin main`, `npm install` in `backend` when `backend/package.json` changed, then `pm2 restart nomads`.

Required repository secrets: `VITE_PROD_LINK`, `VITE_DEV_LINK`, `VITE_GOOGLE_API_KEY`, `VITE_MASTER_PANEL_BE_URL`, `VITE_HOST_PANEL_URL`, `EC2_SSH_KEY`, `EC2_HOST`, `EC2_USER`.

**Vercel** — `backend/vercel.json` and `frontend/vercel.json` both deploy `main` only; the frontend rewrites every path to `/`, the backend routes everything to `server.js`. Configure the same environment variables in the project settings.

Neither path runs migrations; schema changes are plain Mongoose model changes.

## Working in this repository

1. Pull the latest code and install dependencies in the app you are changing.
2. Confirm the relevant `.env` files exist locally.
3. Keep changes scoped to the matching route/controller/model or page/component.
4. Run `npm run lint` (frontend) and the affected flow before opening a pull request.
5. Never commit secrets, local env files, `node_modules`, or build output.
6. Add a short note under `docs/` when a change introduces a workflow another developer will need to understand.

**Conventions**

- ES modules in both apps; backend files use `.js` with `import`/`export`.
- Backend domains are organised as route → controller → model; shared behaviour belongs in `middlewares/` or `utils/`.
- Pages are route-level components; reusable UI belongs in `frontend/src/components`.
- The `Ai*` prefix marks the current AI-assisted page variants; older non-prefixed pages are kept for legacy routes.

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| Backend exits immediately | `MONGO_URL` missing or unreachable |
| Browser CORS error | Frontend origin missing from `backend/config/corsConfig.js` |
| Uploads fail | S3 region, bucket, or key/secret invalid |
| Email flows fail | `EMAIL_USER` / `EMAIL_PASS` missing or rejected by the provider |
| Map or place search empty | `GOOGLE_PLACES_API_KEY` / `VITE_GOOGLE_MAPS_API_KEY` missing |
| Plan price shows a fallback | Master Panel unreachable; check `MASTERPANEL_API_BASE_URL` and `VITE_MASTER_PANEL_BE_URL` |
| Host or verification actions fail locally | `WONOMASTER_BE` / `HOST_PANEL_BE` point at services that need to be running on ports 5007 / 5006 |
| 404 on `/docs/` after deploy | Docs build not copied into `frontend/dist/docs`, or the web server falls back to the SPA |
