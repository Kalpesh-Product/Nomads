# Nomads Developer Documentation

Nomads is a full-stack JavaScript application for the WONO nomad platform. The repository is split into a Vite/React frontend and an Express/MongoDB backend.

## Project Structure

```text
Nomads/
  backend/              Express API, MongoDB models, controllers, routes, middleware
  frontend/             React 19 + Vite client app
  docs/                 Supporting project documentation
  scripts/              Repository-level helper scripts
```

Important backend folders:

- `backend/server.js` - API entrypoint, middleware registration, route mounting, database connection, and server startup.
- `backend/routes/` - Express route modules grouped by domain.
- `backend/controllers/` - Request handlers and business logic.
- `backend/models/` - Mongoose models.
- `backend/config/` - Database, CORS, mailer, multer, S3, and static config.
- `backend/middlewares/` - Shared Express middleware such as JWT verification and error handling.
- `backend/scripts/` - One-off or maintenance scripts.

Important frontend folders:

- `frontend/src/main.jsx` - React entrypoint.
- `frontend/src/App.jsx` and `frontend/src/routes.jsx` - Application shell and route definitions.
- `frontend/src/pages/` - Route-level pages for Nomad, AI Nomad, Host, and company template experiences.
- `frontend/src/components/` - Shared UI components.
- `frontend/src/hooks/` - Shared React hooks.
- `frontend/src/redux/` and `frontend/src/context/` - Client state and auth context.
- `frontend/public/` and `frontend/src/assets/` - Static images, icons, fonts, and public assets.

## Tech Stack

Backend:

- Node.js with ES modules
- Express 5
- MongoDB with Mongoose
- JWT auth with cookie support
- Multer and Sharp for uploads/image handling
- AWS S3 for file storage
- Nodemailer for email

Frontend:

- React 19
- Vite 6
- React Router
- Redux Toolkit and Redux Persist
- TanStack React Query
- Axios
- Tailwind CSS, MUI, Headless UI, lucide-react, react-icons

## Prerequisites

- Node.js 20+ recommended
- npm
- Access to the required backend `.env` values
- MongoDB connection string
- AWS S3 credentials if testing upload flows
- Google Maps/Places keys if testing map, review, or place lookup flows

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

This repository currently has separate `package.json` files for `backend` and `frontend`, so install dependencies in both folders.

## Environment Configuration

Create environment files in:

- `backend/.env`
- `frontend/.env`

Do not commit real secrets.

Common backend variables used by the codebase:

```env
PORT=3000
MONGO_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
PASSWORD_RESET_OTP_SECRET=
FRONTEND_DEV_LINK=http://localhost:5173/
FRONTEND_PROD_LINK=
NOMADS_FRONTEND_URL=http://localhost:5173
ADMIN_API_KEY=

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

Common frontend variables used by the codebase:

```env
VITE_GOOGLE_API_KEY=
VITE_GOOGLE_MAPS_API_KEY=
VITE_MASTER_PANEL_BE_URL=http://localhost:5007
VITE_AI_SCORE_RANGE_MIN=
```

Some flows also use hardcoded production URLs or external APIs. Check the relevant page/controller before testing integrations locally.

## Running Locally

Start the backend API:

```bash
cd backend
npm run dev
```

The backend defaults to `http://localhost:3000` unless `PORT` is set.

Start the frontend:

```bash
cd frontend
npm run dev
```

The Vite dev server is configured for `http://localhost:5173` and host `0.0.0.0`.

Run both services in separate terminals. The backend CORS configuration allows local frontend origins including `5173`, `5174`, `3000`, `3001`, `3006`, and `3007`.

## Available Scripts

Backend scripts:

```bash
npm start
npm run dev
npm run backfill:event-reviews
npm test
```

Notes:

- `npm start` runs `node --tls-min-v1.2 server.js`.
- `npm run dev` runs the backend through `nodemon`.
- `npm test` is currently a placeholder and exits with an error.

Frontend scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Backend API Overview

The backend mounts these main route groups from `backend/server.js`:

- `/api/auth`
- `/api/user`
- `/api/company`
- `/api/poc`
- `/api/review`
- `/api/forms`
- `/api/job`
- `/api/world-ranking`
- `/api/visa-support`
- `/api/visa-rules`
- `/api/consultation-support`
- `/api/company-setup-support`
- `/api/overall-activation-support`
- `/api/new-company-setup`
- `/api/consultation`
- `/api/workation`
- `/api/become-contributor`
- `/api/state-wise-weight`
- `/api/editor`
- `/api/leads`
- `/api/special-access`
- `/api/analytics`
- `/api/admin/nomad-users`
- `/api/news`
- `/api/blogs`
- `/api/events`
- `/api/places`
- `/api/restaurants`
- `/api/restaurant-reviews`
- `/api/restaurantreviews`
- `/api/restaurantpocs`
- `/api/restaurant-pocs`
- `/api/event-reviews`
- `/api/place-reviews`

Protected routes:

- `/api/user` uses JWT verification.
- `/api/admin/nomad-users` uses the admin API key middleware.

Unknown routes return a 404 response in HTML, JSON, or plain text depending on the request `Accept` header.

## Development Workflow

1. Pull the latest code.
2. Install dependencies in both `backend` and `frontend` if package files changed.
3. Confirm `.env` files are present locally.
4. Run the backend and frontend in separate terminals.
5. Use `npm run lint` in `frontend` before shipping frontend changes.
6. For backend changes, run the affected flow manually because the backend test script is currently a placeholder.
7. Keep changes scoped to the relevant route/controller/model/component.

## Data and Upload Notes

- MongoDB connection is required before the API starts.
- File uploads rely on `multer`, `sharp`, and AWS S3 configuration.
- Upload-related code lives primarily in `backend/config/multerConfig.js`, `backend/config/s3Config.js`, and the feature controllers.
- Several controllers create, update, or delete S3 objects. Use non-production buckets for local testing whenever possible.

## Authentication Notes

- Access tokens use `ACCESS_TOKEN_SECRET`.
- Refresh tokens use `REFRESH_TOKEN_SECRET`.
- Cookie parsing and CORS credentials are enabled globally.
- Frontend auth helpers live in `frontend/src/hooks/` and `frontend/src/context/AuthContext.jsx`.

## Deployment Notes

Both `backend/` and `frontend/` include `vercel.json`, indicating they can be deployed separately. Confirm environment variables are configured in the deployment platform before deploying.

## Troubleshooting

- Backend exits immediately: confirm `MONGO_URL` is set and reachable.
- Browser CORS error: confirm the frontend origin is included in `backend/config/corsConfig.js`.
- Uploads fail: confirm S3 region, bucket, access key, and secret key values.
- Email flows fail: confirm `EMAIL_USER` and `EMAIL_PASS`.
- Google map/place flows fail: confirm the required Google API key variable is set.
- Master panel or host panel integrations fail locally: confirm `MASTERPANEL_API_BASE_URL`, `WONOMASTER_BE`, `HOST_PANEL_BE`, and `VITE_MASTER_PANEL_BE_URL`.

## Conventions

- The codebase uses ES modules in both apps.
- Backend domains are generally organized as route -> controller -> model.
- Frontend pages are route-level components; shared UI belongs in `frontend/src/components`.
- Keep environment-specific values in `.env` files.
- Avoid committing generated files, local secrets, logs, and dependency folders.
