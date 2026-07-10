# Running the project without Docker

This project is normally run with `make dev` (Docker Compose). If you don't want to use Docker, you can run the Django backend and Next.js frontend directly on your machine. This guide walks through that setup.

## Prerequisites

- Python 3.12
- Node.js 20
- `pip` and `npm` available on your PATH

## 1. Clone and configure environment variables

```bash
cp .env.example .env
```

The backend reads these directly from your shell environment when run locally (it does not auto-load `.env`), so either `export` them manually or use a tool like `direnv` / `python-dotenv`. At minimum, set:

```bash
export DJANGO_SECRET_KEY=change-me-before-use
export DJANGO_DEBUG=True
export DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
```

## 2. Backend setup (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Without Docker there's no `DB_PATH` env var set, so Django falls back to `backend/db/db.sqlite3` (make sure the `backend/db/` directory exists — create it with `mkdir -p db` if needed).

Optional:

```bash
python manage.py createsuperuser   # equivalent of `make createsuperuser`
```

The API is now available at `http://localhost:8000/api/`, and Swagger UI at `http://localhost:8000/api/docs/`.

## 3. Frontend setup (Next.js)

Open a second terminal:

```bash
cd frontend
npm install
```

### Required change: fix the API proxy target

`frontend/next.config.ts` rewrites `/api/*` to `http://backend:8000/api/:path*/`. The hostname `backend` only resolves inside the Docker Compose network — it will fail to connect when running the frontend directly. Change the destination to point at your local backend:

```ts
// frontend/next.config.ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://localhost:8000/api/:path*/",
    },
  ];
},
```

Remember to revert this if you go back to running via `make dev`, or make it configurable via an environment variable (e.g. `process.env.BACKEND_URL`) if you'll switch between the two often.

### Start the frontend

```bash
npm run dev
```

The app is now available at `http://localhost:3000`.

## 4. Regenerating the API client (if you change backend endpoints)

This still works the same without Docker, just run the underlying Django/npm commands instead of the Makefile targets:

```bash
cd backend
python manage.py spectacular --file openapi.json
cp openapi.json ../frontend/openapi.json

cd ../frontend
npm run generate-api
```

## Summary of command equivalents

| Makefile (Docker) | Without Docker |
|---|---|
| `make dev` | `python manage.py runserver 0.0.0.0:8000` (backend) + `npm run dev` (frontend), in separate terminals |
| `make migrate` | `python manage.py migrate` |
| `make makemigrations` | `python manage.py makemigrations` |
| `make createsuperuser` | `python manage.py createsuperuser` |
| `make shell` | `python manage.py shell` |
| `make reset-db` | delete `backend/db/db.sqlite3`, then `python manage.py migrate` |
| `make generate-schema` | `python manage.py spectacular --file openapi.json` + `cp` to `frontend/openapi.json` |

## Running backend tests without Docker

```bash
cd backend
python manage.py test apps.users
python manage.py test apps.notes
```
