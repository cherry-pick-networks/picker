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
| **main.ts**              | Server entry: Hono app; routes registered from system/routes.ts (imports system/router/*). |
| **client.ts**            | Client entry (loaded on every page).                                                       |
| **system/routes.ts**     | Route list (ROUTES) and registerRoutes(app); scope-check reads this.                      |
| **system/router/**       | Hono handlers: home, kv, ast, ast-demo, scripts (GET/POST /scripts, GET /scripts/*).      |
| **system/store/**        | Storage access (e.g. Deno KV via `getKv()`).                                             |
| **system/service/**      | Shared business logic (e.g. `add`). AST read/patch for shared/runtime/store/; apply via Governance and scripts write. |
| **system/validator/**       | Governance verification; must pass before any apply (e.g. shared/runtime/store mutation). |
| **system/log/**             | Log artifact storage (e.g. test run history JSON); written by tests or tooling, not served by API. |
| **shared/runtime/store/**   | Target path for AST-based self-edit; read and write only via Governance-verified flow.     |

---

## API surface

| Method | Path        | Purpose                                                                                                                             |
| ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`         | Health check; responds `{ "ok": true }`.                                                                                            |
| GET    | `/static/*` | Serve static files from system/static/.                                                                                             |
| GET    | `/kv`       | List keys in Deno KV; optional query `prefix` to filter. Responds `{ "keys": string[] }`.                                           |
| GET    | `/kv/:key`  | Read value by key from Deno KV; responds value or `null`.                                                                           |
| DELETE | `/kv/:key`  | Delete one key from Deno KV; responds 204 No Content.                                                                               |
| POST   | `/kv`       | Write key-value to Deno KV. Body: `{ "key": string, "value": unknown }`. Responds `{ "key": string }` or 400 with validation error. |
| GET    | `/ast`      | AST demo (ts-morph, in-memory sample). Responds `{ "variableDeclarations": number }`.                                               |
| GET    | `/ast-demo` | AST demo page (HTML). Fetches GET /ast and displays variableDeclarations.                                                           |
| GET    | `/scripts`  | List entries in shared/runtime/store/ (Governance-verified). Responds `{ "entries": string[] }`.                                             |
| GET    | `/scripts/:path*` | Read file in shared/runtime/store/ by path (Governance-verified). Responds file content or 404.                                        |
| POST   | `/scripts/:path*` | Write file in shared/runtime/store/ at path (Governance-verified). Body: raw text. Responds 201 or 400/403/500.                        |
| POST   | `/ast/apply`      | Apply a text patch to a file in shared/runtime/store/. Body: `{ "path": string, "oldText": string, "newText": string }`. Governance-verified; responds 200 or 400/403/404/500. |

---

## Mutation boundary

- **Allowed mutation path**: `shared/runtime/store/` only. Read and write only
  through Governance verification (system/validator); no direct write from routes.
- **Must not**: mutate outside shared/runtime/store/; write directly to
  data/config/ or credentials.

---

## Infrastructure

- **Deno KV** — built-in storage only; no external DB, message broker, or queue.
