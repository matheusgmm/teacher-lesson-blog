# Teacher Lesson Blog API

[![CI](https://github.com/matheusgmm/teacher-lesson-blog/actions/workflows/ci.yml/badge.svg)](https://github.com/matheusgmm/teacher-lesson-blog/actions/workflows/ci.yml)
[![Docker](https://github.com/matheusgmm/teacher-lesson-blog/actions/workflows/docker.yml/badge.svg)](https://github.com/matheusgmm/teacher-lesson-blog/actions/workflows/docker.yml)

Node.js backend for a teacher lesson-sharing blog platform built to support public education at scale.

Stack: **Express 5**, **Prisma 7**, **MySQL 8**, **JWT**, **Jest**, **Swagger (OpenAPI 3)**, **GitHub Actions**.

---

## Table of contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [Quick start](#quick-start)
4. [Environment variables](#environment-variables)
5. [Database setup](#database-setup)
6. [Seeded admin account](#seeded-admin-account)
7. [Running the API](#running-the-api)
8. [Swagger documentation](#swagger-documentation)
9. [Postman](#postman)
10. [Testing](#testing)
11. [CI/CD (GitHub Actions)](#cicd-github-actions)
12. [API overview](#api-overview)

---

## Features

- Auth: register, login, logout (JWT + stored tokens)
- Users: profile update, admin user management, soft delete
- Posts: lesson posts with search + pagination
- Role-based access (`USER` / `ADMIN`)
- Interactive Swagger UI
- Unit + endpoint tests (Jest + Supertest)
- CI/CD pipelines with GitHub Actions (tests + Docker image build)

---

## Requirements

- **Node.js** `>= 22.12` (see `.nvmrc` → `22`)
- **npm**
- **Docker** + Docker Compose (recommended for MySQL)
- Optional: [Postman](https://www.postman.com/downloads/)

```bash
nvm use   # if you use nvm
node -v   # should be v22.x
```

---

## Quick start

```bash
# 1) Install dependencies
npm install

# 2) Create your env file
cp .env.example .env
# edit .env (at least MYSQL_PASSWORD and JWT_SECRET)

# 3) Start MySQL
docker compose up db -d

# 4) Apply migrations
npx prisma migrate deploy
# or during local development:
# npx prisma migrate dev

# 5) Generate Prisma Client (also runs on postinstall)
npx prisma generate

# 6) Seed the default admin
npm run db:seed

# 7) Start the API
npm run dev
```

API base URL: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api/docs`  
Health check: `http://localhost:3000/status`

---

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | no | HTTP port (default `3000`) |
| `HOST` | no | Bind host (default `localhost`) |
| `JWT_SECRET` | **yes** | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | no | Token TTL (default `7d`) |
| `JWT_REMEMBER_ME_EXPIRES_IN` | no | Longer TTL when `rememberMe=true` (default `30d`) |
| `MYSQL_HOST` | **yes** | Database host (`localhost` locally, `db` inside Docker Compose app) |
| `MYSQL_PORT` | **yes** | Database port (default `3306`) |
| `MYSQL_USER` | **yes** | Database user |
| `MYSQL_PASSWORD` | **yes** | Database password |
| `MYSQL_DATABASE` | **yes** | Database **name only** (not a full URL) |
| `ADMIN_NAME` | no | Seeded admin name |
| `ADMIN_EMAIL` | no | Seeded admin email |
| `ADMIN_PASSWORD` | no | Seeded admin password |


---

## Database setup

### Option A — Docker Compose (recommended)

```bash
docker compose up db -d
```

This starts MySQL 8 using credentials from `.env`.

Check health:

```bash
docker compose ps
```

### Option B — Local MySQL

Create a database matching `MYSQL_DATABASE` and point `.env` to it.

### Migrations

```bash
npx prisma migrate deploy   # CI / fresh environments
npx prisma migrate dev      # local development (creates migrations)
npx prisma generate         # regenerate Prisma Client after schema changes
```

### Prisma Studio (optional GUI)

```bash
npm run db:studio
```

---

## Seeded admin account

The project ships with a seed script that creates the first **ADMIN** user.

```bash
npm run db:seed
```

**Default credentials** (override via `.env`):

| Field | Default |
|-------|---------|
| Name | `Administrator` |
| Email | `admin@teacherlesson.local` |
| Password | `Admin@123` |
| Role | `ADMIN` |

### Important rules about roles

1. **Public registration** (`POST /api/auth/register` without a token) always creates a `USER`.  
   Sending `"role": "ADMIN"` in the body is **ignored** for security.
2. **Only an authenticated ADMIN** can create another admin:
   - Login as the seeded admin
   - Call `POST /api/auth/register` with header `Authorization: Bearer <admin-token>`
   - Body may include `"role": "ADMIN"`
3. Authenticated non-admin users **cannot** create other users (`403`).

---

## Running the API

```bash
npm run dev     # development (nodemon)
npm start       # production-like (node src/server.js)
```

Full stack with Docker (API + DB):

```bash
docker compose up --build
```

When the app runs inside Compose, `MYSQL_HOST` is overridden to `db`.

---

## Swagger documentation

Interactive OpenAPI 3 docs are available after the server starts:

| Resource | URL |
|----------|-----|
| Swagger UI | http://localhost:3000/api/docs |
| Raw OpenAPI JSON | http://localhost:3000/api/docs.json |
| Spec source file | `src/docs/openapi.yaml` |

### How to use Swagger UI

1. Open http://localhost:3000/api/docs
2. Try `POST /api/auth/login` with the seeded admin:
   ```json
   {
     "email": "admin@teacherlesson.local",
     "password": "Admin@123",
     "rememberMe": true
   }
   ```
3. Copy `data.token` from the response
4. Click **Authorize** (lock icon)
5. Paste the token (Swagger uses the Bearer scheme)
6. Call protected endpoints (Users / Posts)

Authorization persists in the browser session (`persistAuthorization` is enabled).

---

## Postman

Ready-to-import files are in the repository root:

- `Teacher Lesson Blog.postman_collection.json`
- `Teacher Lesson Blog.postman_environment.json`

### Import

1. Open Postman → **Import**
2. Select both JSON files
3. In the top-right environment dropdown, select **Teacher Lesson Blog**

### Configure the environment

| Variable | Purpose | Suggested value |
|----------|---------|-----------------|
| `host` | API base URL | `http://localhost:3000` |
| `token` | JWT for protected requests | filled automatically after Login |

The environment ships with `host` prefilled as `http://localhost:3000`.  
Leave `token` empty — the **Login** request has a test script that stores `data.token` into `{{token}}` on success.

### Recommended flow

1. Select environment **Teacher Lesson Blog**
2. Run **[OPEN] HealthCheck**
3. Run **[OPEN] Login** (seeded admin body is already set)
4. Confirm `token` was saved (Environment → `token`)
5. Run authenticated requests (`[AUTH]` / `[ADMIN]`)

Collection-level auth uses `Bearer {{token}}`, so most protected requests inherit it.


---

## Testing

```bash
npm test              # all tests
npm run test:watch    # watch mode
npm run test:unit     # unit tests only
npm run test:endpoints
npm run test:coverage # coverage report → coverage/lcov-report/index.html
```

Tests mock Prisma and do **not** require a running database.

More details: [`tests/README.md`](./tests/README.md)

---

## CI/CD (GitHub Actions)

This repository automates **CI** (quality checks) and a lightweight delivery check (Docker image build).  
Public cloud deploy is intentionally **not** configured yet.

### Workflows

| Workflow | File | When it runs | What it does |
|----------|------|--------------|--------------|
| **CI** | `.github/workflows/ci.yml` | `push` / `pull_request` → `main` | Install deps → Prisma generate → validate OpenAPI → `npm test` → coverage artifact (uses repository Secrets for `JWT_*` / `MYSQL_*`) |
| **Docker** | `.github/workflows/docker.yml` | `push` / `pull_request` → `main` | Build the production Docker image (`push: false`) |

### What you need to do

1. **Commit and push** the `.github/workflows/` files to GitHub.
2. Open the repo → **Actions** tab → enable workflows if GitHub asks.
3. Push to `main` or open a Pull Request into `main` to trigger the pipelines.
4. Wait for the green checks:
   - `CI / Test (Node 22)`
   - `Docker / Build Docker image`
5. (Recommended) Protect `main`:
   - GitHub → **Settings** → **Branches** → **Add branch protection rule**
   - Branch name: `main`
   - Enable **Require status checks to pass before merging**
   - Select: `Test (Node 22)` (and optionally `Build Docker image`)

### Badges

The badges at the top of this README reflect workflow status after the first successful run.

### Coverage artifact

Each CI run uploads a `coverage-report-node-22` artifact (kept for 7 days).  
Download it from the workflow run page → **Artifacts**.

### Local Docker build (same as CI)

```bash
docker build -t teacher-lesson-blog:local .
```

---

## API overview

| Area | Base path | Notes |
|------|-----------|-------|
| Health | `GET /status` | Public |
| Auth | `/api/auth` | register / login / logout |
| Users | `/api/user` | Bearer required; admin for delete/update-by-id |
| Posts | `/api/post` | Bearer required; admin for write operations |
| Docs | `/api/docs` | Swagger UI |

### Auth cheat sheet

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@teacherlesson.local",
  "password": "Admin@123"
}
```

Then:

```http
Authorization: Bearer <token>
```

---

## License

ISC
