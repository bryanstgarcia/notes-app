# Backend

REST API built with Django and JWT authentication. Two apps: `users` (registration/auth) and `notes` (categorized notes CRUD, scoped to their owner).

## Stack

- Python 3.12
- Django 5
- Django REST Framework
- djangorestframework-simplejwt

## Running locally

### With Docker (recommended)

From the repository root:

```bash
cp .env.example .env
make build
make migrate
make dev
```

The API will be available at `http://localhost:8000/api/`.

### Without Docker

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | `change-me-before-use` |
| `DJANGO_DEBUG` | Enable debug mode | `True` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `localhost,127.0.0.1,backend` |
| `DB_PATH` | Path to the SQLite database file | `backend/db/db.sqlite3` |

## Available endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register/` | AllowAny | Register a new user by email + password (username is server-generated) |
| `POST` | `/api/auth/login/` | AllowAny | Obtain access + refresh JWT tokens, logging in by email |
| `POST` | `/api/auth/refresh/` | AllowAny | Refresh an access token |
| `GET` | `/api/auth/me/` | IsAuthenticated | Retrieve the authenticated user |
| `GET` | `/api/notes/` | IsAuthenticated | List the current user's notes, newest first |
| `POST` | `/api/notes/` | IsAuthenticated | Create a note owned by the current user |
| `GET` | `/api/notes/<id>/` | IsAuthenticated | Retrieve a single note (404 if not owned) |
| `PATCH` | `/api/notes/<id>/` | IsAuthenticated | Partially update a note (404 if not owned); `PUT`/`DELETE` return 405 |

## Generating the OpenAPI schema

From the repository root:

```bash
make generate-schema
```

This runs `python manage.py spectacular --file openapi.json` inside the container and copies the result to `frontend/openapi.json`, which the frontend uses to generate its typed API client.

Explore the API interactively at `http://localhost:8000/api/docs/`.
