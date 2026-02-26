---
title: todo
description: In-todo modules, API surface, and infrastructure.
---

# Todo

Single source of truth for in-todo modules, API surface, and infrastructure. Add
only modules, routes, and infrastructure listed here; update this file first,
then implement.

**Final implementation goal**: See `shared/prompt/goal.md` for the one-line
goal, target phases (MVP vs full spec), todo source, and must/must-not rules.
Use that document for AI direction and todo decisions.

---

## Modules

| Module                    | Role                                                                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **main.ts**               | Server entry: Hono app; routes registered from system/routes.ts (imports system/app/config).                                                                                                 |
| **client.ts**             | Client entry (loaded on every page).                                                                                                                                                         |
| **system/routes.ts**      | Route list (ROUTES) and registerRoutes(app); todo-check reads this.                                                                                                                          |
| **system/app/config/**    | Route registration (home, rest, scripts). Imports domain endpoints only.                                                                                                                     |
| **system/actor/**         | Profile, progress: endpoint, service, store, schema.                                                                                                                                         |
| **system/concept/**       | Ontology validation: store (checkIdsInScheme), service (validateFacetSchemes). Facet ID checks capped at 500 per boundary.md.                                                                |
| **system/content/**       | Items, worksheets, prompt: endpoint, service, store, schema.                                                                                                                                 |
| **system/source/**        | Source collection and KAG: endpoint, service, store, schema, source-extract.service, source-llm.client.                                                                                      |
| **system/script/**        | Scripts store, mutate (LLM offload), Governance: endpoint, service, store, validation.                                                                                                       |
| **system/record/**        | Identity index: endpoint, store (reference/identity-index.toml only).                                                                                                                        |
| **system/schedule/**      | FSRS schedule (in-house algo): endpoint, service, store, schema, fsrs.ts, fsrs-adapter. Weekly plan (3 sessions/week, 3 new units/week) and optional annual curriculum from grammar payload. |
| **system/kv/**            | Generic key-value HTTP API: endpoint, store (Postgres-backed).                                                                                                                               |
| **system/audit/**         | Log artifact storage (e.g. e2e-runs.toml in same dir as audit-e2e-runs.ts). Test/tooling writes run history. Not served by API unless an audit read endpoint is added.                       |
| **shared/runtime/store/** | Target path for self-edit; read and write only via Governance-verified flow.                                                                                                                 |
| **shared/infra/**         | Shared infrastructure. Postgres client (`getPg()`) only; no KV, no business logic.                                                                                                           |

---

## API surface

| Method | Path                               | Purpose                                                                                                                                                                                                                               |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`                                | Health check; responds `{ "ok": true }`.                                                                                                                                                                                              |
| GET    | `/kv`                              | List keys (Postgres-backed); optional query `prefix` to filter. Responds `{ "keys": string[] }`.                                                                                                                                      |
| GET    | `/kv/:key`                         | Read value by key; responds value or `null`.                                                                                                                                                                                          |
| DELETE | `/kv/:key`                         | Delete one key; responds 204 No Content.                                                                                                                                                                                              |
| POST   | `/kv`                              | Write key-value. Body: `{ "key": string, "value": unknown }`. Responds `{ "key": string }` or 400 with validation error.                                                                                                              |
| GET    | `/scripts`                         | List entries in shared/runtime/store/ (Governance-verified). Responds `{ "entries": string[] }`.                                                                                                                                      |
| GET    | `/scripts/:path*`                  | Read file in shared/runtime/store/ by path (Governance-verified). Responds file content or 404.                                                                                                                                       |
| POST   | `/scripts/:path*`                  | Write file in shared/runtime/store/ at path (Governance-verified). Body: raw text. Responds 201 or 400/403/500.                                                                                                                       |
| POST   | `/script/mutate`                   | Mutate file in shared/runtime/store/ (LLM offload). Body: path (required), intent?, options? (maxBlocks?, strategy?). 200 → `{ "ok": true, "replacements": number }`; 4xx/5xx → `{ "ok": false, "status": number, "body": unknown }`. |
| GET    | `/profile/:id`                     | Read actor profile by id. Responds profile object or 404.                                                                                                                                                                             |
| POST   | `/profile`                         | Create actor profile. Body: profile fields (id optional, server-generated if omitted). Responds 201 with profile.                                                                                                                     |
| PATCH  | `/profile/:id`                     | Update actor profile by id. Body: partial profile. Responds 200 or 404.                                                                                                                                                               |
| GET    | `/progress/:id`                    | Read progress state by id. Responds progress object or 404.                                                                                                                                                                           |
| PATCH  | `/progress/:id`                    | Update progress state by id. Body: partial progress. Responds 200 or 404.                                                                                                                                                             |
| GET    | `/content/items/:id`               | Read content item by id. Responds item object or 404.                                                                                                                                                                                 |
| POST   | `/content/items`                   | Create content item. Body: item fields (id optional). Responds 201 with item.                                                                                                                                                         |
| PATCH  | `/content/items/:id`               | Update content item by id. Body: partial item. Responds 200 or 404.                                                                                                                                                                   |
| GET    | `/content/worksheets/:id`          | Read worksheet meta by id. Responds worksheet object or 404.                                                                                                                                                                          |
| POST   | `/content/worksheets/generate`     | Create worksheet (meta + item_ids from concepts). Body: title, concept_ids, item_count, subject_weights (optional record of subject id → weight), etc. Responds 201 with worksheet.                                                   |
| POST   | `/content/worksheets/build-prompt` | Build worksheet prompt string from request and profile/context. Body: GenerateWorksheetRequest (includes optional subject_weights). Responds 200 with { prompt }. No LLM call.                                                        |
| GET    | `/sources`                         | List sources. External: metadata copyright/author stripped; agent: full Source[].                                                                                                                                                     |
| GET    | `/sources/:id`                     | Source by id. External: redacted metadata; agent: full source or 404.                                                                                                                                                                 |
| POST   | `/sources`                         | Collect and store a source. Body: source fields (id optional, body optional). Responds 201 with source.                                                                                                                               |
| POST   | `/sources/:id/extract`             | Extract subject/concept IDs from source body via LLM; save to source extracted_* and return. Body optional. 200 → { ok, concept_ids, subject_id?, extracted_at }; 4xx/5xx → { ok: false, status, body }. Requires source.body.        |
| GET    | `/data/identity-index`             | Read identity index External: id/class only; agent (X-Client: agent): full JSON.                                                                                                                                                      |
| GET    | `/data/identity/:id`               | Read identity student by id External: redacted; agent: full JSON or 404.                                                                                                                                                              |
| GET    | `/schedule/due`                    | List schedule items due in range. Query: actor_id, from, to. Responds { items: ScheduleItem[] }.                                                                                                                                      |
| GET    | `/schedule/plan/weekly`            | Weekly plan by week number. Query: actor_id, week_start, optional level. Responds { week_number, week_start, week_end, new_units, review_units }. new_units from annual by week (1–52).                                               |
| GET    | `/schedule/plan/annual`            | Annual curriculum. Query: year, optional level. Responds { weeks: { week_number (1–52), slots: { slot_index, new_unit }[] }[] }.                                                                                                      |
| GET    | `/schedule/items`                  | List schedule items. Query: actor_id, optional source_id. Responds { items: ScheduleItem[] }.                                                                                                                                         |
| POST   | `/schedule/items`                  | Create schedule item. Body: actor_id, source_id, unit_id. Responds 201 with item.                                                                                                                                                     |
| POST   | `/schedule/items/:id/review`       | Record review. Body: grade (1–4), optional reviewed_at. Responds 200 with updated item.                                                                                                                                               |

- **Sensitive data**: Identity and source metadata (copyright/author) are
  redacted for external callers. Send `X-Client: agent` or
  `Authorization:
  Bearer <INTERNAL_API_KEY>` for full data (agent/internal
  only).

---

## Mutation boundary

- **When mutating**: Use only path `shared/runtime/store/`. Read and write only
  through Governance verification (system/script/validation).
- **MAB·DAG**: MAB and DAG logic remain local (run, build, test, tooling); no
  server-side MAB/DAG orchestration.
- **Routes**: Do not write directly from routes; use system/script/validation
  flow.
- **Source·KAG**: Only Source payload (including extracted_*) and KAG data are
  mutated by POST /sources and POST /sources/:id/extract; no
  shared/runtime/store.
- **Off-limits**: Do not write directly to config/ or credentials; use approved
  mechanisms only. File-based record store (shared/record/) is written only via
  system/record/identity-index.store.ts (identity-index only).

---

## Infrastructure

- **PostgreSQL** — single storage backend. Client: `shared/infra/pg.client.ts`
  (`getPg()`). Domain stores (actor, source, kv, content, schedule) and
  system/kv use it. Tables: `actor_profile`, `actor_progress`, `source`, `kv`,
  `content_item`, `content_worksheet`, `schedule_item`. DDL under
  `shared/infra/schema/` (e.g. `01_actor.sql`, `02_source.sql`,
  `07_schedule.sql`; see reference.md Schema DDL file naming).
- **File-based data** — under `shared/record/reference/`: single file
  `identity-index.toml` (version, description, students). Read via
  system/record/identity-index.store.ts; no store directory.
- **Worksheet prompt templates** — read-only from `shared/runtime/store/` (e.g.
  docs/contract/); Governance-verified read.
- **Change audit log** — stored under `system/audit/log/` (e.g. JSON file(s));
  one entry per mutation (profile, progress, content, scripts/store) with actor,
  timestamp, and change summary; written by routes or services on mutation;
  retention and format defined by implementation.
- **Ontology (Todo 1)** — DDL: `shared/infra/schema/06_ontology.sql`
  (concept_scheme, concept, concept_relation). Seed path:
  `shared/infra/seed/ontology/`. Seed task: `deno task seed:ontology`.
