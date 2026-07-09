# Frontend

Web client built with Next.js, Tailwind CSS, and TypeScript.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS
- TypeScript
- Auto-generated OpenAPI client (`openapi-typescript-codegen`)

## Running locally

### With Docker (recommended)

From the repository root:

```bash
cp .env.example .env
make build
make dev
```

The app will be available at `http://localhost:3000`.

### Without Docker

```bash
cd frontend
npm install
npm run dev
```

## Regenerating the API client

The typed API client is generated from the backend's OpenAPI schema. From the repository root:

```bash
make generate-schema
```

This regenerates `backend/openapi.json`, copies it to `frontend/openapi.json`, and you then run:

```bash
npm run generate-api
```

to regenerate the client into `src/lib/api/`. This should be re-run every time the backend API changes.

## Folder structure

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
│   └── api/              # auto-generated API client, do not edit
└── types/                # additional TypeScript types
```
