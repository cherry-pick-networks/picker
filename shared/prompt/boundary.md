# Scope

Single source of truth for in-scope modules, API surface, and infrastructure. Do
not add new modules, routes, or infrastructure unless listed here; update this
file first, then implement.

**Final implementation goal**: See `shared/prompt/goal.md` for the one-line
goal, target phases (MVP vs full spec), scope source, and must/must-not rules.
Use that document for AI direction and scope decisions.

---

## Modules

| Module                   | Role                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **main.ts**              | Server entry: Hono app; routes registered from system/routes.ts (imports system/router/*). |
| **client.ts**            | Client entry (loaded on every page).                                                       |
| **system/routes.ts**     | Route list (ROUTES) and registerRoutes(app); scope-check reads this.                      |
| **system/router/**       | Hono handlers: home, kv, profile, content, source, ast, ast-demo, scripts (GET/POST /scripts, GET /scripts/*). |
| **system/store/**        | Storage access (e.g. Deno KV via `getKv()`). Profile/progress KV under prefixes `profile`, `progress`. Content items/worksheets under `content` (item, worksheet). Source records under `source`. File-based UUID v7 storage under `data/` in 2-tier layout (record/store, record/reference) via system/store/data.ts. |
| **system/service/**      | Shared business logic (e.g. `add`, profile/progress, content, source collect/read). AST read/patch for shared/runtime/store/; apply via Governance and scripts write. |
| **system/validator/**       | Governance verification; must pass before any apply (e.g. shared/runtime/store mutation). |
| **system/log/**             | Log artifact storage (e.g. test run history JSON, change audit log). Test/tooling writes run history; routes or services append change audit entries (who, when, what) for in-scope mutations. Not served by API unless an audit read endpoint is added. |
| **shared/runtime/store/**   | Target path for AST-based self-edit; read and write only via Governance-verified flow.     |

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
| GET    | `/scripts`  | List entries in shared/runtime/store/ (Governance-verified). Responds `{ "entries": string[] }`.                                             |
| GET    | `/scripts/:path*` | Read file in shared/runtime/store/ by path (Governance-verified). Responds file content or 404.                                        |
| POST   | `/scripts/:path*` | Write file in shared/runtime/store/ at path (Governance-verified). Body: raw text. Responds 201 or 400/403/500.                        |
| POST   | `/ast/apply`      | Apply a text patch to a file in shared/runtime/store/. Body: `{ "path": string, "oldText": string, "newText": string }`. Governance-verified; responds 200 or 400/403/404/500. |
| GET    | `/profile/:id`    | Read actor profile by id. Responds profile object or 404.                                                                 |
| POST   | `/profile`        | Create actor profile. Body: profile fields (id optional, server-generated if omitted). Responds 201 with profile.         |
| PATCH  | `/profile/:id`    | Update actor profile by id. Body: partial profile. Responds 200 or 404.                                                    |
| GET    | `/progress/:id`   | Read progress state by id. Responds progress object or 404.                                                               |
| PATCH  | `/progress/:id`   | Update progress state by id. Body: partial progress. Responds 200 or 404.                                                  |
| GET    | `/content/items/:id`       | Read content item by id. Responds item object or 404.                                                                   |
| POST   | `/content/items`          | Create content item. Body: item fields (id optional). Responds 201 with item.                                            |
| PATCH  | `/content/items/:id`      | Update content item by id. Body: partial item. Responds 200 or 404.                                                      |
| GET    | `/content/worksheets/:id`     | Read worksheet meta by id. Responds worksheet object or 404.                                                            |
| POST   | `/content/worksheets/generate` | Create worksheet (meta + item_ids from concepts). Body: title, concept_ids, item_count, etc. Responds 201 with worksheet. |
| POST   | `/content/worksheets/build-prompt` | Build worksheet prompt string from request and profile/context. Body: GenerateWorksheetRequest. Responds 200 with { prompt }. No LLM call. |
| GET    | `/sources`              | List or query sources (optional query params). Responds `{ "sources": Source[] }`. |
| GET    | `/sources/:id`          | Read source by id. Responds source object or 404. |
| POST   | `/sources`              | Collect and store a source. Body: source fields (id optional). Responds 201 with source. |
| GET    | `/data/extracted-index` | Read extracted-data index (UUID → type, source, oldPath). Responds JSON object. |
| GET    | `/data/identity-index`  | Read identity index (UUID → kind, oldPath). Responds JSON object. |
| GET    | `/data/extracted/:id`   | Read extracted-data file by UUID. Responds JSON body or 404. |
| GET    | `/data/identity/:id`    | Read identity file by UUID. Responds JSON body or 404. |

---

## Mutation boundary

- **Allowed mutation path**: `shared/runtime/store/` only. Read and write only
  through Governance verification (system/validator); no direct write from routes.
- **Must not**: mutate outside shared/runtime/store/; write directly to
  data/config/ or credentials.

---

## Infrastructure

- **Deno KV** — built-in storage only; no external DB, message broker, or queue.
  Key prefixes: `kv` (generic), `profile` (actor profile, key `["profile", id]`),
  `progress` (progress state, key `["progress", id]`),
  `content` (items key `["content", "item", id]`; worksheets key `["content", "worksheet", id]`),
  `source` (source records key `["source", id]`).
- **File-based data** — 2-tier layout under `data/`: infix `record`, suffix `store` (payload) or `reference` (index). Single store: `data/record/store/*.json`. Indexes: `data/record/reference/extracted-data-index.json`, `data/record/reference/identity-index.json`. Populated by migration from `.old`; read/write via system/store/data.ts.
- **Worksheet prompt templates** — read-only from `shared/runtime/store/` (e.g. docs/contract/); Governance-verified read.
- **Change audit log** — stored under `system/log/` (e.g. JSON file(s)); one entry per mutation (profile, progress, content, scripts/store) with actor, timestamp, and change summary; written by routes or services on mutation; retention and format defined by implementation.
