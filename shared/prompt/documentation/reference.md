---
title: reference
description: Project reference for structure, naming, and migration.
---

# Reference

Project reference for structure, naming, and migration.

---

## System structure (system/ infix/suffix)

Under `system/` the form is `system/<infix>/` (one folder per domain). Artifact
type is expressed in the **filename** as `[name].[suffix].ts` (e.g.
`profile.endpoint.ts`, `profile.service.ts`). Infix = domain (bounded context);
suffix = artifact type. Flat layout improves AI context and discovery. Aligns
with store.md §E/§F and modular monolith.

### Allowed infix (domains)

| Infix   | Responsibility                                           |
| ------- | -------------------------------------------------------- |
| actor   | Profile, progress (identity and state)                   |
| content | Items, worksheets, prompt building                       |
| source  | Source collection and read                               |
| script  | Scripts store, AST apply, Governance                     |
| record  | Record store (extracted/identity data)                   |
| kv      | Generic key-value HTTP API (PostgreSQL table kv).        |
| queue   | Task queue (Postgres table, FOR UPDATE SKIP LOCKED)      |
| audit   | Change/run log artifacts                                 |
| app     | Route registration and app wiring                        |

### Allowed suffix (artifacts)

| Suffix     | Meaning                               | §E axis  |
| ---------- | ------------------------------------- | -------- |
| endpoint   | HTTP entry (Hono routes)              | Artifact |
| service    | Application service (use cases)       | —        |
| store      | Persistence (PostgreSQL, file)        | Artifact |
| schema     | Zod schemas and domain types          | Artifact |
| types      | Type-only definitions                 | Meta     |
| transfer   | Request/response or DTO types         | Artifact |
| client     | Client wrapper (e.g. API)             | Artifact |
| validation | Policy/verification (e.g. Governance) | Policy   |
| log        | Log artifact storage                  | Meta     |
| config     | Wiring (e.g. route registration)      | Artifact |

### Target layout (flat domain: files under system/<infix>/)

```
system/
  actor/     *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts, *.transfer.ts
  content/   *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts
  source/    *.endpoint.ts, *.service.ts, *.store.ts
  script/    *.endpoint.ts, *.service.ts, *.store.ts, *.types.ts, *.validation.ts
  record/    *.endpoint.ts, *.store.ts
  kv/        *.endpoint.ts, *.store.ts
  queue/     *.store.ts, *.schema.ts
  audit/     *.log.ts
  app/       *.config.ts
  routes.ts  (entry; imports app/routes-register.config.ts)
```

### Test file names (tests/)

Under `tests/`, every `.ts` file must be `[name]_test.ts` (Deno convention). The
**name** part must use lowercase and hyphens only (§E), e.g.
`main-ast-apply_test.ts`, `scripts-store_test.ts`. Non-test helpers (e.g.
`with_temp_scripts_store.ts`) are listed in PATH_EXCEPTIONS. Validated by
`deno task ts-filename-check`.

### Migration mapping (3-layer → flat, completed)

| Old path (3-layer)                 | New path (flat)                    |
| ---------------------------------- | ---------------------------------- |
| system/actor/endpoint/profile.ts   | system/actor/profile.endpoint.ts   |
| system/actor/service/profile.ts    | system/actor/profile.service.ts    |
| system/actor/store/profile.ts      | system/actor/profile.store.ts      |
| system/content/endpoint/content.ts | system/content/content.endpoint.ts |
| system/content/service/*.ts        | system/content/*.service.ts        |
| system/content/schema/*.ts         | system/content/*.schema.ts         |
| system/source/endpoint             | service                            |
| system/script/endpoint             | service                            |
| system/record/endpoint             | store/data.ts                      |
| system/kv/endpoint                 | store/kv.ts                        |
| system/audit/log/log.ts            | system/audit/audit.log.ts          |
| system/app/config/*.ts             | system/app/*.config.ts             |

### Data file locations (TOML)

| Path                                                | Purpose                              |
| --------------------------------------------------- | ------------------------------------ |
| `shared/record/reference/extracted-data-index.toml` | Extracted-data index (UUID → entry)  |
| `shared/record/reference/identity-index.toml`       | Identity index (UUID → entry)        |
| `shared/record/store/<uuid>.toml`                   | Single record (UUID v7)              |
| `system/audit/e2e-runs.toml`                        | E2E run log (schemaVersion + runs[]) |

### LISTEN/NOTIFY (real-time notifications)

- **Channels**: Use `prefix:topic`; reserved prefix `picker`. Examples:
  `picker:event`, `picker:queue`. Document new channels here when added.
- **Reconnection**: Dedicated LISTEN connection (shared/infra/pg.listen.ts).
  On disconnect: exponential backoff from 500 ms, cap 30 s; then reconnect and
  re-issue LISTEN for all subscribed channels. No UNLISTEN on unsubscribe;
  connection stays open until process exit.
- **Delivery**: `notify(channel, payload)` uses getPg(). subscribe() keeps a
  long-lived connection and LISTENs; delivery to onMessage depends on driver
  support for async notifications (@db/postgres does not expose them yet).

### Modular monolith rules

- Within a domain: endpoint → service → store/schema only.
- Cross-domain: do not import another domain's store; use that domain's service
  if needed.
- app/*.config.ts only imports domain endpoints and registers routes; no
  business logic.
### Domain dependency (acyclic; hierarchy)

Cross-domain service calls must not form a cycle. Upper domains (orchestration)
may call support domains; support domains must not call upper domains or each
other unless the matrix below allows it.

**Hierarchy**

- **Upper (orchestration)**: content (items, worksheets, prompt building). May
  call support domains via their service only.
- **Support**: actor, script, source, record, kv, queue, audit. Do not import
  content; do not depend on each other unless listed in the matrix. app only
  imports endpoints and is outside this hierarchy.

**Allowed dependency matrix**

Rows = source domain (importer). Columns = target domain (imported). Only
service (and types/schema where needed) may be imported cross-domain; store
imports are forbidden (see Modular monolith rules above).

| From \\ To | actor | content | source | script | record | kv | queue | audit |
| ---------- | ----- | ------- | ------ | ------ | ------ | -- | ----- | ----- |
| actor      | —     | no      | no     | no     | no     | no | no    | no    |
| content    | yes   | —       | no     | yes    | no     | no | no    | no    |
| source     | no    | no      | —      | no     | no     | no | no    | no    |
| script     | no    | no      | no     | —      | no     | no | no    | no    |
| record     | no    | no      | no     | no     | —      | no | no    | no    |
| kv         | no    | no      | no     | no     | no     | —  | no    | no    |
| queue      | no    | no      | no     | no     | no     | no | —     | no    |
| audit      | no    | no      | no     | no     | yes    | no | no    | —     |

When adding a new cross-domain service dependency: (1) ensure it does not
introduce a cycle; (2) add the edge to this matrix and to the allowlist in
`shared/prompt/scripts/check-domain-deps.ts`; (3) then implement.

---

## Profile preferences.worksheet_generation (contract)

Actor profile `preferences.worksheet_generation` is a document/contract-only
shape (schema remains `Record<string, unknown>`). Fields used by worksheet
prompt building:

| Field               | Type    | Description                                                                 |
| ------------------- | ------- | --------------------------------------------------------------------------- |
| `goal_accuracy`     | number? | 0–1; existing. Rendered as percentage in prompt.                            |
| `structural_notes`  | string? | Existing. Passage structure / clue placement instructions.                  |
| `vocabulary_policy` | string? | Existing. Vocabulary control.                                               |
| `gimmick`           | string? | **New.** One-line summary of wrong-answer gimmick (e.g. perfectionism).     |
| `gimmick_notes`     | string? | **New.** Optional detailed description.                                     |
| `distractor_policy` | string? | **New.** Distractor design instructions (e.g. "plausible but not in text"). |

Only `distractor_policy` is currently substituted into the worksheet prompt
(`{{distractor_policy}}`). `gimmick` and `gimmick_notes` are stored for future
use (e.g. Scope B/C).

---

## TypeScript symbol naming (§T)

Rules are in store.md §T. This section gives examples and exceptions from
`system/` and shared scripts.

| Symbol kind           | Case                   | Example                                                          |
| --------------------- | ---------------------- | ---------------------------------------------------------------- |
| Type, interface       | PascalCase             | `Profile`, `Item`, `PatchProfileInput`, `ApplyResult`            |
| Function, method      | camelCase              | `getProfile`, `createItem`, `applyPatch`, `getPatchProfileInput` |
| Variable, parameter   | camelCase              | `id`, `profile`, `parsed`, `raw`                                 |
| Zod schema constant   | PascalCase             | `ProfileSchema`, `ItemSchema`, `CreateItemRequestSchema`         |
| Magic-string constant | UPPER_SNAKE_CASE       | §P; e.g. long error messages, headers                            |
| Class                 | PascalCase             | — (use when introducing classes)                                 |
| Enum name             | PascalCase             | —                                                                |
| Enum member           | One style project-wide | UPPER_SNAKE_CASE or PascalCase                                   |

### Schema property names (exception)

- **Default**: camelCase for new domains (e.g. `createdAt`, `updatedAt` in
  `system/actor/profile.schema.ts`).
- **Exception**: snake_case when the shape is dictated by an external API or
  persistence contract; document in the file (e.g. "API/DB contract"). Example:
  `system/content/content.schema.ts` uses `item_id`, `created_at`,
  `worksheet_id` for stored/API payload shape.

---

## Scope repository: ontology and knowledge graph

Reference for later implementation. Facet taxonomy (SKOS-style) and knowledge
map (prerequisite graph) on picker-dev (PostgreSQL + Deno). Use any scope when
it fits; update boundary.md (and this reference if adding a new domain) before
implementing that scope. Design rationale: prior architecture discussion (facet
axes, DDC resolution, ltree + edge hybrid).

**Prerequisites**: PostgreSQL (e.g. picker_dev) reachable; Deno with Hono, Zod;
DB admin for extensions/tables (e.g. `CREATE EXTENSION ltree`).

### Scope 1 — Infrastructure: ontology schema and seed

**Boundary**: Infrastructure in boundary.md (shared/infra, DDL, seed). No new
modules or API routes.

- **DDL** (shared/infra/schema/): ltree extension → concept_scheme → concept →
  concept_relation → optional knowledge_node / knowledge_edge. concept_scheme:
  id, pref_label, created_at. concept: id, scheme_id, pref_label, notation,
  source, created_at; optional path ltree. concept_relation: source_id,
  target_id, relation_type (broader, narrower, related, exactMatch). Optional
  knowledge_node (path ltree, label, node_type, concept_id), knowledge_edge
  (source_id, target_id, relation_type e.g. requires). New file e.g.
  `05_ontology.sql`; per §J.
- **Seed**: Versioned path (e.g. shared/infra/seed/); TOML or SQL; idempotent;
  one-line run (e.g. deno task seed:ontology). DDC top-level or exactMatch
  only; finer granularity via concept.source and relations.
- **Boundary**: Add ontology tables and seed location/task to Infrastructure.
- **Verify**: List tables; SELECT concept_scheme/concept; if ltree, path query;
  re-run seed; no duplicate keys.

### Scope 2 — Concept module and API

**Boundary**: New module + API surface in boundary.md; reference.md: add infix
**concept** and target layout for system/concept/ if new domain.

- **Module** (system/concept/): concept.store.ts (pg), concept.schema.ts (Zod,
  ID prefixes subj-, type-, cog-, ctx-), concept.service.ts, concept.endpoint.ts;
  register via system/app/config.
- **API**: e.g. GET /concepts/schemes, GET /concepts/schemes/:schemeId/concepts,
  GET /concepts/:id. No new routes without boundary update (§K).
- **Boundary + reference**: Module row for system/concept/; API rows; add
  concept to allowed infix and target layout in this file.
- **Verify**: GET known scheme/concept id → 200; invalid id → 404/400.

### Scope 3 — Content integration (concept tagging)

**Boundary**: Extends system/content; validation may use system/concept. No new
module.

- **Tagging**: content_item/worksheet fields subjectIds, contentTypeId,
  cognitiveLevelId, contextIds; Zod with prefix checks; validate IDs against
  concept store or allowlist.
- **Validation**: On create/update, reject unknown concept IDs (LLM hallucination
  mitigation).
- **Boundary**: Update API surface description if request shape changes.
- **Verify**: Valid concept IDs → success; invalid id → 400.

### Scope 4 — LLM ingestion (optional)

**Boundary**: Script or internal endpoint; document in boundary if it adds a
route or script path.

- **Pipeline**: Input text → LLM → JSON (concept IDs, optional requires edges)
  → Zod validate → insert/update via concept store/service.
- **Safety**: Validate all IDs and relation types against DB; reject unknown;
  log or quarantine low-confidence output.
- **Verify**: Sample run; invalid LLM output rejected.

### Scope repository summary

| Scope | Boundary touch       | Deliverable                                   |
| ----- | -------------------- | --------------------------------------------- |
| 1     | Infrastructure       | DDL, seed, boundary Infrastructure             |
| 2     | Modules + API        | system/concept/, routes, boundary + reference |
| 3     | Content (existing)   | Tagging schema, validation, boundary API desc |
| 4     | Optional             | Script or internal endpoint; boundary if route |

Before adding modules or API: update shared/prompt/boundary.md (§K). New
files under system/: allowed infix/suffix only (this reference). Design
context: facet taxonomy, DDC, ltree, edu:requires (prior architecture
discussion).

---

## Scope repository: worksheet archiving removal

Goal: remove worksheet persistence entirely. Worksheet generation remains
response-only (no DB write). Submission carries the worksheet snapshot
(item_ids and optional display metadata) so grading and briefing do not
depend on a stored worksheet. Implement scopes in order; update
boundary.md when changing API or infrastructure (§K).

### Scope 1 — Submission schema and create flow

**Boundary**: system/content schema and submission create only. No new
routes; no removal yet.

- **Schema** (content.schema.ts): Add to Submission and
  CreateSubmissionRequest: `item_ids: z.array(z.string())` (required),
  optional `title`, `sheet_label`. Keep `worksheet_id` as optional
  correlation id for grouping.
- **Create flow** (content-submission.service): buildSubmissionRaw and
  createSubmission persist `item_ids` (and optional title/sheet_label)
  in submission payload.
- **Verify**: POST /content/submissions with item_ids returns 201; payload
  contains item_ids; GET submission returns same.

### Scope 2 — Grading and briefing from submission

**Boundary**: content domain only. Grading and briefing must not call
worksheet store.

- **Grading**: Replace “get items by worksheet_id” with “get items by
  submission.item_ids”. Add getItemsByItemIds(item_ids) (store or
  service helper); submission endpoint and grading path use
  submission.item_ids to load items. Remove or refactor getItemsForWorksheet
  so it is no longer used for grading.
- **Briefing**: buildBriefingContext(worksheetId): drop getWorksheet call;
  use listSubmissions(worksheetId), take first submission’s item_ids (and
  title/sheet_label) to load items and build sessionId/dateIso/sheetLabel.
  If no submissions for worksheet_id, return null.
- **Verify**: GET submission?include=grading works using submission.item_ids;
  buildBriefingPrompt(worksheet_id) works when submissions exist with that
  worksheet_id and item_ids.

### Scope 3 — Remove worksheet persistence and GET route

**Boundary**: boundary.md API and Infrastructure; system/content store and
endpoints.

- **Generate**: content-worksheet.service: remove saveWorksheet call;
  generateWorksheet returns buildWorksheetMeta result without persisting.
- **Store**: content.store: remove getWorksheet, setWorksheet, and
  SQL_WORKSHEET_GET / SQL_WORKSHEET_UPSERT.
- **Service**: content.service: remove getWorksheet export and implementation.
- **Endpoint**: content-worksheet.endpoint: remove getWorksheet handler.
  Keep postWorksheetsGenerate and postWorksheetsBuildPrompt.
- **Routes**: Remove GET /content/worksheets/:id from app config and
  system/routes.ts.
- **Boundary**: boundary.md: remove GET /content/worksheets/:id row; update
  POST /content/worksheets/generate description (e.g. “Responds 201 with
  worksheet; not persisted”).
- **Verify**: POST /content/worksheets/generate does not insert into
  content_worksheet; GET /content/worksheets/:id no longer registered.

### Scope 4 — DB migration and doc/tests

**Boundary**: shared/infra/schema, boundary Infrastructure list, tests and
reference text.

- **Migration**: New file under shared/infra/schema/ (e.g.
  02_content_drop_worksheet.sql) per §J: DROP TABLE IF EXISTS
  content_worksheet.
- **DDL cleanup**: In 02_content.sql remove content_worksheet table
  creation. In 02_content_add_payload.sql remove content_worksheet
  ALTERs.
- **Boundary**: Infrastructure table list: remove content_worksheet.
- **Docs**: reference.md / system README: state that worksheets are
  generated only (not stored); submission carries item_ids.
- **Tests**: content-submission_test: submissions include item_ids.
  content-briefing_test: “missing worksheet” expressed as no submissions
  for worksheet_id. Remove any assertion that worksheet is persisted after
  generate.
- **Verify**: Migration runs; content_worksheet absent; tests pass.

### Scope repository summary (worksheet archiving removal)

| Scope | Boundary touch       | Deliverable                                      |
| ----- | -------------------- | ------------------------------------------------ |
| 1     | Content schema       | Submission item_ids (required), create flow      |
| 2     | Content service      | Grading/briefing use submission.item_ids only   |
| 3     | API, store, routes   | No worksheet persistence; GET route removed     |
| 4     | Infra, docs, tests   | DROP table migration; boundary/docs; test fixes  |
