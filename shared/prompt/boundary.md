# Scope

Single source of truth for in-scope modules, API surface, and infrastructure. Do
not add new modules, routes, or infrastructure unless listed here; update this
file first, then implement.

**Final implementation goal**: See `shared/prompt/plan.md` for the one-line
goal, target phases (MVP vs full spec), scope source, and must/must-not rules.
Use that document for AI direction and scope decisions.

---

## Modules

| Module                   | Role                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **main.ts**              | Server entry: Fresh App, staticFiles, API routes delegated from system/router, fsRoutes. |
| **client.ts**            | Client entry (loaded on every page).                                                     |
| **system/router/**       | File-based route handlers: `/`, GET `/kv`, `/kv/:key`, POST `/kv`, `/ast`, `/ast-demo`, GET `/scripts`, GET `/scripts/:path`. |
| **system/store/**        | Storage access (e.g. Deno KV via `getKv()`).                                             |
| **system/service/**      | Shared business logic (e.g. `add`).                                                      |
| **system/validator/**    | Governance verification; must pass before any apply (e.g. ops/scripts mutation).         |
| **system/component/**    | UI components (e.g. Button).                                                             |
| **system/presentation/** | Fresh islands / interactive UI (e.g. Counter).                                          |
| **ops/scripts/**         | Target path for AST-based self-edit; read and write only via Governance-verified flow.   |

---

## API surface

| Method | Path        | Purpose                                                                                                                             |
| ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`         | Health check; responds `{ "ok": true }`.                                                                                            |
| GET    | `/kv`       | List keys in Deno KV; optional query `prefix` to filter. Responds `{ "keys": string[] }`.                                           |
| GET    | `/kv/:key`  | Read value by key from Deno KV; responds value or `null`.                                                                           |
| DELETE | `/kv/:key`  | Delete one key from Deno KV; responds 204 No Content.                                                                               |
| POST   | `/kv`       | Write key-value to Deno KV. Body: `{ "key": string, "value": unknown }`. Responds `{ "key": string }` or 400 with validation error. |
| GET    | `/ast`      | AST demo (ts-morph, in-memory sample). Responds `{ "variableDeclarations": number }`.                                               |
| GET    | `/ast-demo` | AST demo page (HTML). Fetches GET /ast and displays variableDeclarations.                                                           |
| GET    | `/scripts`  | List entries in ops/scripts/ (Governance-verified). Responds `{ "entries": string[] }`.                                             |
| GET    | `/scripts/:path*` | Read file in ops/scripts/ by path (Governance-verified). Responds file content or 404.                                        |

---

## Mutation boundary

- **Allowed mutation path**: `ops/scripts/` only. Read and write only through
  Governance verification (system/validator); no direct write from routes.
- **Must not**: mutate outside ops/scripts/; write directly to data/config/ or
  credentials.

---

## Infrastructure

- **Deno KV** — built-in storage only; no external DB, message broker, or queue.
