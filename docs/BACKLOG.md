---
title: todo
description: In-todo modules and infrastructure.
---

# Todo

Single source of truth for in-todo modules and
infrastructure. Add only modules and infrastructure listed
here; update this file first, then implement. API contract:
sharepoint/context/documentation/openapi.yaml; route list:
application/routes.ts. Todo-check validates routes against
openapi.yaml. Domain consolidation: see
sharepoint/context/documentation/MANUAL.md § Domains and API
paths (6 + App).

**Final implementation goal**: See
`sharepoint/context/CONTEXT.md` §5 for the one-line goal, target
phases (MVP vs full spec), todo source, and must/must-not
rules. Use that document for AI direction and todo
decisions.

---

## Modules

| Module                    | Role                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **main.ts**               | Server entry: Hono app; routes from application/routes.ts.                                                      |
| **client.ts**             | Client entry (minimal; diagnostics/health only). New features = API + docs.                                |
| **application/routes.ts**      | Route list (ROUTES) and registerRoutes(app); todo-check validates against openapi.yaml.                    |
| **application/app/**           | Route registration, auth. Imports domain endpoints only.                                                   |
| **application/identity/**      | Actors (actor_id, display_name, level, progress) + actor schedule (due, plan, items, review).              |
| **application/governance/**    | Scripts store, mutate, allowlist/ontology (data only). Replaces script + concept.                          |
| **application/content/**       | Source CRUD, extract; material (source + lexis entries); content item CRUD; view aggregation (source-dashboard). |
| **application/governance/**    | Scripts store, mutate, allowlist/ontology; audit log (e.g. e2e_runs).                                      |
| **sharepoint/runtime/store/** | Target path for self-edit; read and write only via Governance-verified flow.                               |
| **application/infra/**         | Postgres client (`getPg()`), SQL loader, schema applier, seed runners, KV storage, batch (e.g. dbListAll). |

---

## Minimization and legacy removal

Roadmap and phases (copilot-assisted only, composite API
decomposition, LLM boundary, client/UI trim) are in
sharepoint/context/documentation/MANUAL.md § API and Copilot
scope. Keep openapi.yaml and application/routes.ts aligned when
adding or changing routes.

---

## Mutation boundary

- **When mutating**: Use only path `sharepoint/runtime/store/`.
  Read and write only through Governance verification
  (application/script/validation).
- **MAB·DAG**: MAB and DAG logic remain local (run, build,
  test, tooling); no server-side MAB/DAG orchestration.
- **Routes**: Do not write directly from routes; use
  application/script/validation flow.
- **Source·KAG**: Only Source payload (including
  extracted_*) and KAG data are mutated by POST /sources and
  POST /sources/:id/extract; no sharepoint/runtime/store.
- **Off-limits**: Do not write directly to config/ or
  credentials; use approved mechanisms only. File-based
  record store (sharepoint/record/) is written only via
  application/record/identityIndexStore.ts (identity_index only).

---

## Infrastructure

- **PostgreSQL** — single storage backend. Client:
  `application/infra/pgClient.ts` (`getPg()`). Domain stores:
  identity, content; KV and batch in infra. DDL data under
  `sharepoint/infra/schema/` (see MANUAL.md). Apply:
  `deno task db:schema` (application/infra/applySchema.ts).
- **File-based data** — identity_index.toml under
  `sharepoint/record/reference/` may remain as legacy; Identity
  domain can migrate to DB (actor table).
- **Worksheet prompt templates** — read-only from
  `sharepoint/runtime/store/` (e.g. docs/contract/);
  Governance-verified read.
- **Change audit log** — stored under `application/governance/`
  (e.g. e2e_runs.toml); one entry per mutation (profile,
  progress, content, scripts/store) with actor, timestamp,
  and change summary; written by routes or services on
  mutation; retention and format defined by implementation.
- **Ontology (Todo 1)** — DDL:
  `sharepoint/infra/schema/06_ontology.sql`. Seed data:
  `sharepoint/infra/seed/ontology/`. Seed task:
  `deno task seed:ontology`
  (application/governance/runSeedOntology.ts).
- **View API** — GET /views/source-dashboard/:id returns
  aggregated source info, lexis summary, and related items
  (payload->>'source'). Index: content_item
  ((payload->>'source')) for fast lookup.
- **View API** — GET /views/actor-briefing/:id returns
  aggregated Outlook briefing (10 Outlook GETs in one
  response).
- **View API** — GET /views/team-briefing/:class_id returns
  aggregated Teams briefing (10 report/teams GETs in one
  response).
- **Assessment Engine** — POST
  /content/engines/assessment/generate: type (WRONG_ANSWER |
  NEXT_ITEM | DIAGNOSE) + context → options | item |
  diagnosis.
- **Report Query** — POST /report/query: metrics[] +
  optional filters → { [metric]: result }.
- **Content recommendations** — GET /content/recommendations
  (actor_id, intent, optional limit/scheme_id/context)
  returns unified list (semantic | rag | semantic_items |
  semantic_and_rag).
