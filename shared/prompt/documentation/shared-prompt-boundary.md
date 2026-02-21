# Scope

Single source of truth for in-scope modules, API surface, and infrastructure. Do
not add new modules, routes, or infrastructure unless listed here; update this
file first, then implement.

---

## Modules

| Module                   | Role                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **main.ts**              | Server entry: Fresh App, staticFiles, API routes delegated from system/router, fsRoutes. |
| **client.ts**            | Client entry (loaded on every page).                                                     |
| **system/router/**       | File-based route handlers: `/`, GET `/kv`, `/kv/:key`, POST `/kv`, `/ast`.               |
| **system/store/**        | Storage access (e.g. Deno KV via `getKv()`).                                             |
| **system/service/**      | Shared business logic (e.g. `add`).                                                      |
| **system/component/**    | UI components (e.g. Button).                                                             |
| **system/presentation/** | Fresh islands / interactive UI (e.g. Counter).                                           |

---

## API surface

| Method | Path       | Purpose                                                                                                                             |
| ------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`        | Health check; responds `{ "ok": true }`.                                                                                            |
| GET    | `/kv`      | List keys in Deno KV; optional query `prefix` to filter. Responds `{ "keys": string[] }`.                                           |
| GET    | `/kv/:key` | Read value by key from Deno KV; responds value or `null`.                                                                           |
| POST   | `/kv`      | Write key-value to Deno KV. Body: `{ "key": string, "value": unknown }`. Responds `{ "key": string }` or 400 with validation error. |
| GET    | `/ast`     | AST demo (ts-morph, in-memory sample). Responds `{ "variableDeclarations": number }`.                                               |

---

## Infrastructure

- **Deno KV** — built-in storage only; no external DB, message broker, or queue.
