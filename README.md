# ApplyTrack — Job Application Manager

A responsive **full-stack** job application tracker with real accounts, PostgreSQL persistence and a midnight-violet React dashboard. Built as a practical entry-level software engineering portfolio project.

## Features

- User registration and login; bcrypt-hashed passwords and 12-hour JWT sessions
- Personal application pipeline: add, list, edit, delete and update status
- Application records include company, job role, date, posting URL and notes
- Search by company/role and filter by job status
- Dashboard counts for submitted applications, interviews and offers
- Database queries use parameter placeholders and scope all records to the signed-in user
- Frontend and backend unit tests, plus GitHub Actions build workflow

## Stack

**Frontend:** React 19, TypeScript, Vite, CSS, Lucide React

**Backend:** Node.js 22, Express, PostgreSQL (`pg`), JWT, bcrypt

**Development:** Docker Compose, Node test runner, Vitest, GitHub Actions

## Quick start

Prerequisites: Node.js 22+, npm and Docker (or PostgreSQL 16 with the schema applied).

```bash
docker compose up -d db
cp server/.env.example server/.env
cd server && npm install && npm run dev
```

In **another terminal** at the repository root:

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api` requests to `http://localhost:4001`. Windows PowerShell equivalent for copying the environment file: `Copy-Item server/.env.example server/.env`.

**Security:** Replace the sample JWT secret before using this beyond localhost. Database password in Docker Compose is for local testing only. Do not commit `.env`, real passwords, or API keys.

The initial PostgreSQL schema is applied automatically **only when the Docker volume is first created**. If you change schema later, apply a migration manually; do not delete data volumes without a backup.

## API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Create session |
| GET | `/api/applications` | List signed-in user's applications (up to 200) |
| POST | `/api/applications` | Create application |
| PATCH | `/api/applications/:id` | Edit or update status |
| DELETE | `/api/applications/:id` | Delete application |

## Checks

```bash
cd server && npm test
cd ../web && npm test && npm run build
```

CI runs backend validation tests, frontend helper tests, and a production frontend compile. **End-to-end and PostgreSQL integration tests are future work.**

## Production limitations

The MVP stores the JWT in browser localStorage (convenient for a portfolio demo, but exposed to XSS). A production version should use secure HttpOnly cookies, CSRF protection, a session revocation strategy, HTTPS and stronger deployment controls. Currently the application list is limited to 200 rows per account; server-side pagination is planned.

To deploy: provision a PostgreSQL database, configure backend environment variables, apply the SQL schema and deploy the frontend with `VITE_API_BASE_URL` set to the backend origin. **No live deployment is included by this repository.**

## Author

[Toufiqul Islam](https://github.com/Toufiqul-27)
