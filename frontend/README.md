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
│   ├── (auth)/                 # login and register routes (layout without navbar)
│   │   ├── login/
│   │   └── register/
│   └── (protected)/            # routes that require an active session
│       ├── dashboard/          # notes dashboard with category sidebar
│       └── note/[id]/          # note detail / inline-edit view
├── features/
│   ├── auth/                   # login, sign-up, session context (AuthProvider/useAuth), token storage
│   ├── dashboard/               # notes list, category sidebar, create-note flow
│   └── notes/                   # note detail view, editable fields, autosave hook
├── components/
│   └── ui/                     # shared primitives: Button, Input, TextLink, CloseButton, ColorDropdown/, NoteCard/
├── lib/
│   └── api/                    # auto-generated API client, do not edit
├── utils/                      # shared constants and formatting helpers (not auto-generated)
├── assets/                     # onboarding/empty-state illustrations
└── types/                      # additional TypeScript types (currently empty; domain types come from lib/api/models)
```

Feature modules follow a `hooks/` (state/logic) + `components/` (presentational) split, composed by a top-level container component (e.g. `LoginView`, `NotesDashboardView`, `NoteDetailView`).
