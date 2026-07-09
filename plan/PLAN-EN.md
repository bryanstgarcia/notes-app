# Project Plan — Django + Next.js Monorepo

> This document is a step-by-step execution guide for Claude Code.
> Each section describes **what to create**, **where**, and **why**.
> Do not skip ahead; complete each section in order before continuing.

---

## 1. Monorepo Architecture

### Target directory structure

```
my-app/
├── backend/                  # Django REST API
│   ├── config/               # settings, urls, wsgi, asgi
│   ├── apps/                 # Django applications (one folder per domain)
│   │   └── users/            # authentication and user management
│   ├── requirements.txt
│   ├── manage.py
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                 # Next.js App Router
│   ├── src/
│   │   ├── app/              # Next.js routes (App Router)
│   │   ├── components/       # reusable components
│   │   ├── lib/              # utilities and generated API client
│   │   └── types/            # additional TypeScript types
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── openapi.json          # OpenAPI schema generated from Django
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml        # full local orchestration
├── .env.example              # documented environment variables
├── Makefile                  # unified commands
├── README.md                 # global monorepo description
└── CLAUDE.md                 # project context for Claude Code
```

### Design principles

- **Full separation**: backend and frontend are independent projects. Neither imports code from the other.
- **HTTP-only communication**: the frontend consumes the backend REST API. The contract is the OpenAPI schema.
- **SQLite for local development**: no external database server. The `.sqlite3` file lives in a Docker volume to persist across restarts.
- **No Nginx**: Next.js rewrites redirect `/api/*` to the Django backend. No reverse proxy needed for local development.
- **One command to start everything**: `make dev` starts both backend and frontend.

---

## 2. Root monorepo files

### 2.1 `docker-compose.yml`

Create at the root. Defines two services:

**`backend`**
- Build from `./backend/Dockerfile`
- Command: `python manage.py runserver 0.0.0.0:8000`
- Volumes: `./backend:/app` (hot reload) and `sqlite_data:/app/db` (DB persistence)
- Port: `8000:8000`
- Environment variables from `.env` plus `DB_PATH=/app/db/db.sqlite3`

**`frontend`**
- Build from `./frontend/Dockerfile`
- Command: `npm run dev`
- Volumes: `./frontend:/app` and `/app/node_modules` (important: prevents the host from overwriting the container's node_modules)
- Port: `3000:3000`
- Depends on `backend`

**Named volume**
```yaml
volumes:
  sqlite_data:
```

### 2.2 `.env.example`

Document all required variables:

```
DJANGO_SECRET_KEY=change-me-before-use
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
```

### 2.3 `Makefile`

Targets to include:

| Target | Actual command |
|---|---|
| `dev` | `docker compose up` |
| `build` | `docker compose build` |
| `down` | `docker compose down` |
| `logs` | `docker compose logs -f` |
| `migrate` | `docker compose run --rm backend python manage.py migrate` |
| `makemigrations` | `docker compose run --rm backend python manage.py makemigrations` |
| `createsuperuser` | `docker compose run --rm backend python manage.py createsuperuser` |
| `shell` | `docker compose run --rm backend python manage.py shell` |
| `reset-db` | bring down, delete volume `monorepo_sqlite_data`, re-run migrate |
| `generate-schema` | run the OpenAPI generation command and copy the JSON to the frontend |

---

## 3. Backend initialization

### 3.1 `backend/README.md`

Create with the following sections:
- Description: REST API with Django and JWT authentication
- Stack: Python 3.12, Django 5, Django REST Framework, SimpleJWT
- How to run locally (with Docker and without Docker)
- Required environment variables
- Available endpoints (table): `POST /api/auth/register/`, `POST /api/auth/login/`, `POST /api/auth/refresh/`, `GET /api/auth/me/`
- How to generate the OpenAPI schema

### 3.2 `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
```

### 3.3 `backend/requirements.txt`

Dependencies to include:

```
django==5.0.6
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.4.0
drf-spectacular==0.27.2
```

> `drf-spectacular` is required to generate the OpenAPI schema consumed by the frontend.

### 3.4 Django configuration — `backend/config/settings.py`

**`INSTALLED_APPS`** must include:
```python
"rest_framework",
"rest_framework_simplejwt",
"corsheaders",
"drf_spectacular",
"apps.users",
```

**`MIDDLEWARE`**: `corsheaders.middleware.CorsMiddleware` must go **first**.

**`DATABASES`**: SQLite pointing to the `DB_PATH` environment variable:
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.environ.get("DB_PATH", BASE_DIR / "db" / "db.sqlite3"),
    }
}
```

**`REST_FRAMEWORK`**:
```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}
```

**`SIMPLE_JWT`**:
```python
from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
}
```

**`CORS_ALLOWED_ORIGINS`**:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

**`SPECTACULAR_SETTINGS`**:
```python
SPECTACULAR_SETTINGS = {
    "TITLE": "My App API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
```

**`AUTH_USER_MODEL`**: `"users.User"`

### 3.5 `backend/config/urls.py`

Include:
- `admin/`
- `api/auth/` → users app urls
- `api/schema/` → `SpectacularAPIView` (generates the JSON)
- `api/docs/` → `SpectacularSwaggerUIView` (optional UI, useful for exploration)

### 3.6 `apps/users` app

**`models.py`**: `User` class extending `AbstractUser`. No extra fields for now; future extension happens here.

**`serializers.py`**:
- `RegisterSerializer`: fields `username`, `email`, `password` (write_only, min_length=8). The `create` method uses `User.objects.create_user`.
- `UserSerializer`: fields `id`, `username`, `email`.

**`views.py`**:
- `RegisterView`: `CreateAPIView`, `AllowAny`.
- `MeView`: `RetrieveAPIView`, `IsAuthenticated`, returns `self.request.user`.

**`urls.py`**:
```
POST  register/   → RegisterView
POST  login/      → TokenObtainPairView
POST  refresh/    → TokenRefreshView
GET   me/         → MeView
```

**`apps.py`**: `name = "apps.users"`

**`migrations/__init__.py`**: empty file so Django recognizes the module.

---

## 4. Frontend initialization

### 4.1 `frontend/README.md`

Create with the following sections:
- Description: web client with Next.js, Tailwind, and TypeScript
- Stack: Next.js 14 (App Router), Tailwind CSS, TypeScript, auto-generated OpenAPI client
- How to run locally
- How to regenerate the API client (`make generate-schema` from the root)
- Folder structure and its purpose

### 4.2 Initialize Next.js

Use the official command inside `frontend/`:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias
```

This automatically generates: `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `package.json`, and the `src/app/` structure.

### 4.3 `frontend/Dockerfile`

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
```

### 4.4 `frontend/next.config.ts`

Configure rewrites to proxy `/api/*` to the Django backend. This removes the need for CORS in development:

```typescript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:8000/api/:path*",
      },
    ];
  },
};
```

> `backend` is the service name in `docker-compose.yml`. Docker resolves the DNS automatically.

### 4.5 Auto-generated OpenAPI client

Install as a dev dependency:

```bash
npm install --save-dev openapi-typescript-codegen
```

Add script to `package.json`:

```json
"generate-api": "openapi --input ./openapi.json --output ./src/lib/api --client fetch"
```

The `openapi.json` file is generated from Django via `make generate-schema` and copied to `frontend/openapi.json`. The generated client lives in `src/lib/api/` and **must never be edited manually** — it is auto-generated code.

### 4.6 `src/` folder structure

Create the following empty folders with a `.gitkeep`:

```
src/
├── app/
│   ├── (auth)/           # login and register routes (layout without navbar)
│   │   ├── login/
│   │   └── register/
│   └── (protected)/      # routes that require an active session
│       └── dashboard/
├── components/
│   └── ui/               # base components (buttons, inputs, etc.)
├── lib/
│   └── api/              # ← auto-generated, do not edit
└── types/                # additional TypeScript types
```

---

## 5. Global `README.md` (monorepo root)

Create at the root with the following sections:

1. **Project name and description** (one line)
2. **Stack** — table with technology, version, and purpose:

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Django 5 + DRF | REST API |
| Authentication | SimpleJWT | Access + Refresh tokens |
| Frontend | Next.js 14 | App Router, SSR |
| Styles | Tailwind CSS | CSS utilities |
| Types | TypeScript | Client-side typing |
| API contract | OpenAPI / drf-spectacular | Auto-generated schema |
| Database | SQLite | Local development |
| Orchestration | Docker Compose | Start everything with one command |

3. **Prerequisites**: Docker and Docker Compose installed.

4. **Quick start**:
```bash
git clone <repo>
cd <repo>
cp .env.example .env
make build
make migrate
make dev
```

5. **Development URLs**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api/`
   - Swagger UI: `http://localhost:8000/api/docs/`

6. **Available commands** — table with all Makefile targets and their description.

7. **Monorepo structure** — directory tree with a one-line description per folder.

8. **OpenAPI schema workflow** — explain that the contract between backend and frontend is the schema, and how to regenerate it when the API changes.

---

## 6. `CLAUDE.md` (monorepo root)

This file is read by Claude Code at the start of every session. Its purpose is to provide enough context so Claude can work without unnecessary questions.

### Required content

```markdown
# Project context for Claude Code

## What this project is
[Business / app purpose description in 2-3 sentences]

## Architecture
Monorepo with two independent projects:
- `backend/`: REST API with Django. Exposes endpoints under `/api/`.
- `frontend/`: web client with Next.js that consumes that API.

Communication between them is exclusively via HTTP.
The contract is defined by the OpenAPI schema generated at `frontend/openapi.json`.

## How to start the project
`make dev` from the root. Requires Docker.

## Backend conventions
- Django apps live in `backend/apps/<name>/`.
- Each app has: `models.py`, `serializers.py`, `views.py`, `urls.py`, `tests.py`.
- New endpoints are registered in `backend/config/urls.py`.
- After changing models: `make makemigrations` then `make migrate`.
- After changing endpoints: `make generate-schema` to update the frontend client.

## Frontend conventions
- Uses Next.js App Router. Routes go in `frontend/src/app/`.
- The API client is in `frontend/src/lib/api/` and is **auto-generated**. Do not edit manually.
- For backend calls, import from `src/lib/api/` — never use `fetch` directly.
- Styles with Tailwind CSS. No CSS modules or styled-components.
- Strict TypeScript. No `any` unless justified with a comment.

## Database
SQLite in development. The file lives in the Docker volume `sqlite_data`.
To reset: `make reset-db`.

## Environment variables
See `.env.example`. Copy to `.env` before starting.
Sensitive variables never go in code — always in `.env`.

## What NOT to do
- Do not install dependencies directly inside the container. Add them to `requirements.txt` or `package.json` and run `make build`.
- Do not edit files in `frontend/src/lib/api/` — they are auto-generated.
- Do not add business logic to Django views; that belongs in serializers or a services module.
```

---

## Execution order for Claude Code

1. Create root directory structure
2. Create `docker-compose.yml`, `.env.example`, `Makefile`
3. Initialize backend: Dockerfile, requirements.txt, config/, apps/users/
4. Create `backend/README.md`
5. Initialize frontend with `create-next-app`
6. Configure `next.config.ts` (proxy), install `openapi-typescript-codegen`
7. Create folder structure under `src/`
8. Create `frontend/README.md`
9. Create global `README.md`
10. Create `CLAUDE.md`
11. Verify: `make build` completes without errors
12. Verify: `make migrate` creates the tables
13. Verify: `make dev` starts both services
