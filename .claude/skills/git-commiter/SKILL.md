---
name: git-commiter
description: Create git commits using the Conventional Commits format, always with an explicit scope and a clear description of exactly what changed and why. Use whenever the user asks to commit, create a commit, or write a commit message for staged/unstaged changes in this repo.
---

# Conventional Commit Skill

Writes commits that are unambiguous about **what** changed and **where**, using [Conventional Commits](https://www.conventionalcommits.org/). Every commit header MUST include a scope — an unscoped `type: subject` is never acceptable output from this skill.

Only run when the user has explicitly asked for a commit (see the repo-wide git safety rules — never commit proactively, never `--no-verify`, never `--amend` unless asked, never `push --force`).

---

## Workflow

1. **Inspect the change set** — run in parallel:
   - `git status` (never with `-uall`)
   - `git diff` (unstaged) and `git diff --staged` (already staged)
   - `git log --oneline -10` to match this repo's existing message style
2. **Group changes by scope.** Look at which top-level area each changed file belongs to (see [Scope rules](#scope-rules-for-this-repo) below). If the diff spans two or more unrelated scopes, **do not** invent a vague shared scope (`chore(misc)`, `fix(various)`) — tell the user the changes should be split into separate commits, and either commit them one scope at a time (staging only the files for that scope) or ask how they want to proceed.
3. **Pick the type** from the table below based on the actual intent of the change, not just the file type.
4. **Draft the message**:
   - Header: `type(scope): subject` — imperative mood, lowercase subject, no trailing period, ≤ 72 characters (aim for ≤ 50).
   - Body (required for anything beyond a trivial one-line change): wrap at ~72 columns, blank line after the header, explain **why** the change was made, not a restatement of the diff.
   - Footer (only when applicable): `BREAKING CHANGE: <description>` for breaking changes, or issue references the user gives you (e.g. `Refs: #123`). Never invent an issue number.
   - Breaking change shorthand: `type(scope)!: subject` plus a `BREAKING CHANGE:` footer explaining the migration impact.
5. **Stage only the files relevant to this commit** by name (never `git add -A` / `git add .`).
6. **Create the commit** via a heredoc so formatting survives intact:
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): subject

   Body explaining why, wrapped at ~72 columns.

   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   EOF
   )"
   ```
7. **Verify** with `git status` that the commit succeeded and nothing unintended got left staged or unstaged.
8. If a pre-commit hook fails, fix the root cause, re-stage, and create a **new** commit — never `--amend` a commit that never happened, never skip hooks.

---

## Format reference

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type** — one of the fixed set below.
- **scope** — required, lowercase, single word/dash-case, names the area of the codebase affected (see below).
- **subject** — imperative, present tense ("add", not "added"/"adds"), no capital first letter unless a proper noun, no trailing period.
- **body** — optional only for truly trivial changes (typo fix, formatting); otherwise required. Explains motivation and contrast with previous behavior, not a line-by-line narration of the diff.
- **footer** — optional; `BREAKING CHANGE:` or issue references only.

---

## Types

| Type | Use when... |
|---|---|
| `feat` | A new capability is added (a new endpoint, a new component, a new field). |
| `fix` | A bug is corrected — behavior didn't match intent. |
| `refactor` | Internal restructuring with no behavior change (e.g. moving logic from a view into a service). |
| `perf` | A change made specifically to improve performance. |
| `docs` | Documentation only (`README`, `CLAUDE.md`, docstrings/comments). |
| `style` | Formatting/whitespace/lint-only changes with zero logic impact. |
| `test` | Adding or correcting tests only. |
| `build` | Build system or packaging changes (`requirements.txt`, `package.json`, Dockerfiles). |
| `ci` | CI/CD pipeline configuration. |
| `chore` | Routine maintenance that doesn't fit elsewhere (tooling config, `.gitignore`). |
| `revert` | Reverts a previous commit. |

---

## Scope rules for this repo

Derive the scope from the most specific directory the change actually lives in — never leave it generic if a more precise scope is available:

| Changed path | Scope |
|---|---|
| `backend/apps/users/**` | `users` |
| `backend/apps/notes/**` | `notes` |
| `backend/config/**` (settings, root urls) | `backend` |
| `backend/openapi.json` | `api` |
| Auth flow touching both a backend app and JWT config | `auth` |
| `frontend/src/app/(auth)/**` | `auth` (frontend) — clarify in the body which side if ambiguous |
| `frontend/src/app/(protected)/**` | `frontend` unless it's clearly one feature, then use the feature name |
| `frontend/src/features/<name>/**` | `<name>` |
| `frontend/src/components/**` | `ui` |
| `frontend/src/lib/api/**` | `api` (should only appear alongside an `openapi.json` regen, per this repo's rules — regenerated, not hand-edited) |
| `frontend/openapi.json` | `api` |
| `Makefile`, `docker-compose.yml`, `Dockerfile*` | `docker` |
| `.github/**` | `ci` |
| `requirements.txt` | `backend-deps` (or `build` type with scope `backend`) |
| `package.json` / `package-lock.json` | `frontend-deps` (or `build` type with scope `frontend`) |
| `.env.example`, root config | `config` |
| `.claude/**` | `claude` |
| Root `CLAUDE.md` / `README.md` | `docs` |

If a change is truly repo-wide (e.g. a root lint config affecting both apps), use `repo` as the scope rather than omitting it.

---

## Examples

```
fix(users): reject empty password on registration

The register serializer accepted a blank string because
PasswordField only validated max_length, not presence.
Added a required + min_length check so empty submissions
return a 400 instead of creating an unusable account.
```

```
feat(notes): add note ownership check in delete endpoint

Any authenticated user could delete another user's note
because the view queried NoteModel directly instead of
scoping by owner_id. Delegated the check to NoteService
so the rule lives in one place.
```

```
refactor(backend): move note validation out of the view

Business rule enforcement (empty title+content check)
was living in NoteListCreateView, violating this repo's
layering convention. Moved it into NoteService.create_note.
```

```
chore(docker): bump backend base image to python:3.12-slim
```

---

## What this skill does NOT do

- ❌ Produce a commit header without a scope.
- ❌ Bundle unrelated scopes into a single commit to save time — it flags the split instead.
- ❌ Commit without the user having explicitly asked for a commit in this turn.
- ❌ Use `git add -A`/`git add .`, `--amend`, `--no-verify`, or force-push.
- ❌ Invent issue numbers, ticket references, or breaking-change footers not confirmed by the user.
