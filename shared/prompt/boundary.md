---
title: boundary
description: In-scope modules, API surface, and infrastructure.
---

# Scope

Single source of truth for in-scope modules, API surface, and infrastructure.
Add only modules, routes, and infrastructure listed here; update this file
first, then implement.

**Final implementation goal**: See `shared/prompt/goal.md` for the one-line
goal, target phases (MVP vs full spec), scope source, and must/must-not rules.
Use that document for AI direction and scope decisions.

---

## Modules

| Module                    | Role                                                                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **main.ts**               | Server entry: Hono app; routes registered from system/routes.ts (imports system/app/config).                                                                      |
| **client.ts**             | Client entry (loaded on every page).                                                                                                                              |
| **system/routes.ts**      | Route list (ROUTES) and registerRoutes(app); scope-check reads this.                                                                                              |
| **system/app/config/**    | Route registration (home, rest, ast, scripts). Imports domain endpoints only.                                                                                     |
| **system/actor/**         | Profile, progress: endpoint, service, store from shared/infra pg, schema.                                                                                         |
| **system/content/**       | Items, worksheets, prompt, knowledge graph (nodes/edges): endpoint, service, store, schema.                                                                      |
| **system/concept/**       | Concept schemes and concepts (ontology): endpoint, service, store, schema.                                                                                         |
| **system/source/**        | Source collection: endpoint, service, store.                                                                                                                      |
| **system/script/**        | Scripts store, AST apply, Governance: endpoint, service, store, validation.                                                                                       |
| **system/record/**        | Record store (extracted/identity): endpoint, store.                                                                                                               |
| **system/kv/**            | Generic key-value: endpoint, store (PostgreSQL table kv).                                                                                                         |
| **system/queue/**         | Task queue: store, schema (Postgres task_queue, FOR UPDATE SKIP LOCKED).                                                                                          |
| **system/audit/**         | Log artifact storage (e.g. e2e-runs.toml in same dir as audit.log.ts). Test/tooling writes run history. Not served by API unless an audit read endpoint is added. |
| **shared/runtime/store/** | Target path for AST-based self-edit; read and write only via Governance-verified flow.                                                                            |
| **shared/infra/**         | Shared infrastructure. PostgreSQL single client (`getPg()`); notify/subscribe (LISTEN/NOTIFY) in pg.notify.ts, pg.listen.ts; no business logic. |

---

## API surface

| Method | Path                               | Purpose                                                                                                                                                                        |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/`                                | Health check; responds `{ "ok": true }`.                                                                                                                                       |
| GET    | `/kv`                              | List keys; optional query `prefix` to filter. Responds `{ "keys": string[] }`.                                                                                                  |
| GET    | `/kv/:key`                         | Read value by key; responds value or `null`.                                                                                                                                   |
| DELETE | `/kv/:key`                         | Delete one key; responds 204 No Content.                                                                                                                                      |
| POST   | `/kv`                              | Write key-value. Body: `{ "key": string, "value": unknown }`. Responds `{ "key": string }` or 400 with validation error.                                                       |
| GET    | `/ast`                             | AST demo (ts-morph, in-memory sample). Responds `{ "variableDeclarations": number }`.                                                                                          |
| GET    | `/ast-demo`                        | AST demo page (HTML). Fetches GET /ast and displays variableDeclarations.                                                                                                      |
| GET    | `/scripts`                         | List entries in shared/runtime/store/ (Governance-verified). Responds `{ "entries": string[] }`.                                                                               |
| GET    | `/scripts/:path*`                  | Read file in shared/runtime/store/ by path (Governance-verified). Responds file content or 404.                                                                                |
| POST   | `/scripts/:path*`                  | Write file in shared/runtime/store/ at path (Governance-verified). Body: raw text. Responds 201 or 400/403/500.                                                                |
| POST   | `/ast/apply`                       | Apply a text patch to a file in shared/runtime/store/. Body: `{ "path": string, "oldText": string, "newText": string }`. Governance-verified; responds 200 or 400/403/404/500. |
| GET    | `/profile/:id`                     | Read actor profile by id. Responds profile object or 404.                                                                                                                      |
| POST   | `/profile`                         | Create actor profile. Body: profile fields (id optional, server-generated if omitted). Responds 201 with profile.                                                              |
| PATCH  | `/profile/:id`                     | Update actor profile by id. Body: partial profile. Responds 200 or 404.                                                                                                        |
| GET    | `/progress/:id`                    | Read progress state by id. Responds progress object or 404.                                                                                                                    |
| PATCH  | `/progress/:id`                    | Update progress state by id. Body: partial progress. Responds 200 or 404.                                                                                                      |
| GET    | `/content/items/:id`               | Read content item by id. Responds item object or 404.                                                                                                                          |
| POST   | `/content/items`                   | Create content item. Body: item fields (id optional); subjectIds, contentTypeId, cognitiveLevelId, contextIds (concept IDs, validated). Responds 201 or 400 on unknown concept ID. |
| PATCH  | `/content/items/:id`               | Update content item by id. Body: partial item (tagging fields validated). Responds 200, 400 on unknown concept ID, or 404.                                                       |
| GET    | `/content/worksheets/:id`          | Read worksheet meta by id. Responds worksheet object or 404.                                                                                                                   |
| POST   | `/content/worksheets/generate`     | Create worksheet (meta + item_ids from concepts). Body: title, concept_ids, subjectIds, contentTypeId, cognitiveLevelId, contextIds, item_count, etc. Unknown concept ID → 400.  |
| POST   | `/content/worksheets/build-prompt` | Build worksheet prompt string from request and profile/context. Body: GenerateWorksheetRequest. Responds 200 with { prompt }. No LLM call.                                     |
| POST   | `/content/submissions`             | Create submission. Body: worksheet_id, student_id, answers (item_id → option index); submission_id optional. Responds 201 with Submission.                                     |
| GET    | `/content/submissions/:id`         | Read submission by id. Query `include=grading` optional: attach grading result (total, correct, score, results). Responds 200 or 404.                                          |
| GET    | `/content/submissions`             | List submissions. Query `worksheet_id` optional; `include=grading` optional. Responds 200 with `{ submissions: Submission[] }`.                                                |
| POST   | `/content/briefing/build-prompt`   | Build briefing prompt from worksheet submissions, grading, and profiles. Body: worksheet_id, student_ids optional. Responds 200 with { prompt } or 404 if worksheet not found. |
| GET    | `/concepts/schemes`                | List concept schemes. Responds `{ "schemes": ConceptScheme[] }`.                                                                                                  |
| GET    | `/concepts/schemes/:schemeId`     | Read concept scheme by id. Responds scheme or 404.                                                                                                                |
| GET    | `/concepts/schemes/:schemeId/concepts` | List concepts in a scheme. Responds `{ "concepts": Concept[] }` or 404 if scheme not found.                                                                   |
| GET    | `/concepts/:id`                   | Read concept by id. Responds concept or 404.                                                                                                                     |
| GET    | `/sources`                         | List or query sources (optional query params). Responds `{ "sources": Source[] }`.                                                                                             |
| GET    | `/sources/:id`                     | Read source by id. Responds source object or 404.                                                                                                                              |
| POST   | `/sources`                         | Collect and store a source. Body: source fields (id optional). Responds 201 with source.                                                                                       |
| GET    | `/data/extracted-index`            | Read extracted-data index (UUID → type, source, oldPath). Responds JSON object.                                                                                                |
| GET    | `/data/identity-index`             | Read identity index (UUID → kind, oldPath). Responds JSON object.                                                                                                              |
| GET    | `/data/extracted/:id`              | Read extracted-data file by UUID. Responds JSON body or 404.                                                                                                                   |
| GET    | `/data/identity/:id`               | Read identity file by UUID. Responds JSON body or 404.                                                                                                                         |

---

## Mutation boundary

- **When mutating**: Use only path `shared/runtime/store/`. Read and write only
  through Governance verification (system/script/validation).
- **Routes**: Do not write directly from routes; use system/script/validation
  flow.
- **Off-limits**: Do not write directly to config/ or credentials; use approved
  mechanisms only. File-based record store (shared/record/) is written only via
  system/record/store/data.ts.

---

## Infrastructure

- **Real-time notifications (Pub/Sub)** — LISTEN/NOTIFY. notify via
  `shared/infra/pg.notify.ts` (uses `getPg()`); subscribe via
  `shared/infra/pg.listen.ts` (dedicated long-lived connection, reconnection
  policy documented). Channel naming and reconnection: see
  shared/infra/pg.listen.ts and shared/prompt/documentation/reference.md.
- **PostgreSQL (single client)** — primary SQL store. Single client only; no
  external message broker or queue. Client: `shared/infra/pg.client.ts`
  (`getPg()`). Optional transaction wrapper: `withTx(fn)`. DDL under
  `shared/infra/schema/` (e.g. `00_init.sql`, `01_actor.sql`, `02_content.sql`,
  `02_content-add-payload.sql`, `02_content-concept-tagging.sql`,
  `03_source.sql`, `04_kv.sql`, `05_knowledge.sql`, `05_ontology.sql`,
  `06_task-queue.sql`).
  Tables: actor_profile, actor_progress, content_item, content_worksheet,
  content_submission, source, kv, knowledge_node, knowledge_edge,
  concept_scheme, concept, concept_relation, task_queue. Actor
  profile and progress use PostgreSQL (system/actor from shared/infra pg).
  Content items, worksheets, and submissions use PostgreSQL
  (system/content/content.store.ts from getPg()).
- **Ontology seed** — versioned under `shared/infra/seed/` (TOML or SQL);
  idempotent; run with `deno task seed:ontology`. DDC top-level or exactMatch
  only; finer granularity via concept.source and concept_relation.
- **File-based data** — under `shared/record/`: suffix `store` (payload) or
  `reference` (index). Store: `shared/record/store/*.toml`. Indexes:
  `shared/record/reference/extracted-data-index.toml`,
  `shared/record/reference/identity-index.toml`. Populated by migration from
  `.old`; read/write via system/record/data.store.ts.
- **Worksheet prompt templates** — read-only from `shared/runtime/store/`;
  Governance-verified read.
- **Change audit log** — stored under `system/audit/log/` (e.g. JSON file(s));
  one entry per mutation (profile, progress, content, scripts/store) with actor,
  timestamp, and change summary; written by routes or services on mutation;
  retention and format defined by implementation.
