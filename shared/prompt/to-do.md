---
title: todo
description: In-todo modules, API surface, and infrastructure.
---

# Todo

Single source of truth for in-todo modules, API surface, and infrastructure. Add only modules,
routes, and infrastructure listed here; update this file first, then implement. Domain
consolidation: see `shared/prompt/documentation/system-domain-identity-mirror-spec.md`.

**Final implementation goal**: See `shared/prompt/goal.md` for the one-line goal, target phases (MVP
vs full spec), todo source, and must/must-not rules. Use that document for AI direction and todo
decisions.

---

## Modules

| Module                    | Role                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **main.ts**               | Server entry: Hono app; routes from system/routes.ts.                                                      |
| **client.ts**             | Client entry (minimal; diagnostics/health only). New features = API + docs.                                |
| **system/routes.ts**      | Route list (ROUTES) and registerRoutes(app); todo-check reads this.                                        |
| **system/app/**           | Route registration, auth. Imports domain endpoints only.                                                   |
| **system/identity/**      | Actors: actor_id, display_name, level, progress. List/search by name. Replaces actor + record.             |
| **system/governance/**    | Scripts store, mutate, allowlist/ontology (data only). Replaces script + concept.                          |
| **system/source/**        | Source CRUD, extract. Allowlist data only (no Governance import).                                          |
| **system/mirror/**        | Client-owned data backup/sync: content (items, worksheets), lexis, schedule. Minimal API; no build-prompt. |
| **system/storage/**       | Generic key-value (kv). Postgres-backed.                                                                   |
| **system/audit/**         | Event/audit log. Log artifact storage (e.g. e2e-runs).                                                     |
| **shared/runtime/store/** | Target path for self-edit; read and write only via Governance-verified flow.                               |
| **shared/infra/**         | Shared infrastructure. Postgres client (`getPg()`) only; no KV, no business logic.                         |

---

## API surface

Paths align with six domains + App. Identity = actors (display_name, level, progress). Mirror =
backup/sync only.

| Method | Path                                | Purpose                                                                                                        |
| ------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| GET    | `/`                                 | Health check; responds `{ "ok": true }`.                                                                       |
| GET    | `/identity/actors`                  | List actors. Query: name or display_name. Responds actor_id, display_name, level, progress.                    |
| GET    | `/identity/actors/:id`              | Read actor by id. Responds actor object or 404.                                                                |
| POST   | `/identity/actors`                  | Create actor. Body: display_name (required), optional level, progress. Server returns actor_id.                |
| PATCH  | `/identity/actors/:id`              | Update actor. Body: partial display_name, level, progress. Responds 200 or 404.                                |
| GET    | `/scripts`                          | List entries in shared/runtime/store/ (Governance). Responds `{ "entries": string[] }`.                        |
| GET    | `/scripts/:path*`                   | Read store file by path. Responds content or 404.                                                              |
| POST   | `/scripts/:path*`                   | Write store file at path. Body: raw text. 201 or 400/403/500.                                                  |
| POST   | `/script/mutate`                    | Mutate store file (LLM). Body: path (required), intent?, options?. 200 → ok, replacements; 4xx/5xx → ok false. |
| GET    | `/sources`                          | List sources. Entra OAuth; returns Source[].                                                                   |
| GET    | `/sources/:id`                      | Source by id. Returns full source or 404.                                                                      |
| POST   | `/sources`                          | Create source. Body: source fields (id optional). 201 with source.                                             |
| POST   | `/sources/:id/extract`              | Extract concept/subject IDs from source body (LLM); save and return. Body optional.                            |
| GET    | `/mirror/content/items/:id`         | Read content item (Mirror backup). 200 or 404.                                                                 |
| POST   | `/mirror/content/items`             | Create content item. Body: item fields. 201 with item.                                                         |
| PATCH  | `/mirror/content/items/:id`         | Update content item. Body: partial. 200 or 404.                                                                |
| GET    | `/mirror/content/worksheets/:id`    | Read worksheet meta. 200 or 404.                                                                               |
| POST   | `/mirror/content/worksheets`        | Create worksheet (atomic). Body: title?, item_ids (required). 201 with worksheet.                              |
| GET    | `/mirror/lexis/entries`             | List lexis entries. Query: source_id, days, or q (utterance). Responds { entries } or 400.                     |
| GET    | `/mirror/schedule/due`              | Schedule items due. Query: actor_id, from, to. { items }.                                                      |
| GET    | `/mirror/schedule/plan/weekly`      | Weekly plan. Query: actor_id, week_start, level?.                                                              |
| GET    | `/mirror/schedule/plan/annual`      | Annual curriculum. Query: year, level?.                                                                        |
| GET    | `/mirror/schedule/items`            | List schedule items. Query: actor_id, source_id?.                                                              |
| POST   | `/mirror/schedule/items`            | Create schedule item. Body: actor_id, source_id, unit_id. 201.                                                 |
| POST   | `/mirror/schedule/items/:id/review` | Record review. Body: grade (1–4), reviewed_at?. 200.                                                           |
| GET    | `/kv`                               | List keys; optional query prefix. Responds `{ "keys": string[] }`.                                             |
| GET    | `/kv/:key`                          | Read value by key. Value or null.                                                                              |
| POST   | `/kv`                               | Write key-value. Body: key, value. 200 with key or 400.                                                        |
| DELETE | `/kv/:key`                          | Delete one key. 204 No Content.                                                                                |

- **Auth**: All routes except `GET /` require `Authorization: Bearer <Entra
  access token>`. Valid
  token yields full data; missing/invalid returns 401.

---

## Minimization and legacy removal

Roadmap and phases (copilot-assisted only, composite API decomposition, LLM boundary, client/UI
trim) are in `shared/prompt/documentation/copilot-minimal-plan.md`. Keep API surface and
openapi.yaml aligned with that plan when adding or changing routes.

---

## Mutation boundary

- **When mutating**: Use only path `shared/runtime/store/`. Read and write only through Governance
  verification (system/script/validation).
- **MAB·DAG**: MAB and DAG logic remain local (run, build, test, tooling); no server-side MAB/DAG
  orchestration.
- **Routes**: Do not write directly from routes; use system/script/validation flow.
- **Source·KAG**: Only Source payload (including extracted_*) and KAG data are mutated by POST
  /sources and POST /sources/:id/extract; no shared/runtime/store.
- **Off-limits**: Do not write directly to config/ or credentials; use approved mechanisms only.
  File-based record store (shared/record/) is written only via system/record/identityIndexStore.ts
  (identity-index only).

---

## Infrastructure

- **PostgreSQL** — single storage backend. Client: `shared/infra/pgClient.ts` (`getPg()`). Domain
  stores: identity (actors: actor_id, display_name, level, progress), source, storage (kv), mirror
  (content_item, content_worksheet, schedule_item, lexis_entry). DDL under `shared/infra/schema/`
  (see reference.md).
- **File-based data** — identity-index.toml under `shared/record/reference/` may remain as legacy;
  Identity domain can migrate to DB (actor table).
- **Worksheet prompt templates** — read-only from `shared/runtime/store/` (e.g. docs/contract/);
  Governance-verified read.
- **Change audit log** — stored under `system/audit/log/` (e.g. JSON file(s)); one entry per
  mutation (profile, progress, content, scripts/store) with actor, timestamp, and change summary;
  written by routes or services on mutation; retention and format defined by implementation.
- **Ontology (Todo 1)** — DDL: `shared/infra/schema/06_ontology.sql` (concept_scheme, concept,
  concept_relation). Seed path: `shared/infra/seed/ontology/`. Seed task: `deno task seed:ontology`.
