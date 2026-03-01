---
title: manual
description: Project reference for structure, naming, and migration.
---

# Reference

Project reference for structure, naming, and migration.

---

## API and Copilot scope

- **Principles**: PICKER is the backend for copilot-assisted
  use only. Users talk to the copilot (local or Studio); the
  copilot calls the API. No legacy dual auth or human-facing
  UI beyond diagnostics/health. New features = API + docs
  only.
- **Auth**: Entra ID OAuth 2.0 only. All routes except
  `GET /` require
  `Authorization: Bearer <Entra access token>`; valid token
  yields full data.
- **Contract**: openapi.yaml and system/routes.ts define
  paths and schemas. Keep them in sync. Copilot Studio: use
  openapi.yaml and Entra app (Client ID, Tenant ID, OAuth
  2.0).
- **Roles**: Data store (profile, progress, content,
  sources, schedule, records, lexis); Governance (script
  mutate, allowlist); server LLM only for Governance, source
  extract, Lexis utterance (regex first, LLM fallback, TTL
  cache). Content item generation: use build-prompt + local
  LLM + POST /content/items per PRIMER.md § Copilot API
  usage.
- **Keep**: Entra OAuth 2.0, atomic CRUD, Governance +
  script mutate + source extract, FSRS/schedule, ontology
  seed, Lexis entries, openapi.yaml, prompt-only APIs.
  **Remove / do not reintroduce**: X-Client: agent,
  INTERNAL_API_KEY, composite APIs (replace with atomic then
  remove), human-facing legacy UI, unused endpoints.
- **Verification**: `deno task todo-check` (routes in
  system/routes.ts listed in openapi.yaml);
  `deno task type-check-policy` (no type-check bypass).
  Modules and infrastructure: BACKLOG.md.

---

## Path config (config/path-config.json)

Directory and key file paths are defined in
`config/path-config.json` under the key `paths`. Use
`shared/context/scripts/pathConfig.ts`: `getPath(key)`
returns the root-relative path for a key (e.g. `store`,
`todo`, `contextScripts`); `getPaths()` returns all key→path
pairs. Do not hardcode those paths in TypeScript; when
changing directory structure, update `config/path-config.json`
`paths` and keep `deno.json` tasks / `lint.plugins` literals
in sync (no variable substitution in task strings). See
RULESET.md §2 (Paths single source).

**Paths 키 목록은 config/path-config.json `paths`와 동기화됨.**
등록된 키는 `config/path-config.json`과 `pathConfig.ts`의 `PathKey`
유니온에 동일하게 유지한다.

---

## System structure (CAF 5-axis · 5-tier)

Directory and resource naming align to the **CAF (Cloud
Adoption Framework) 5-axis model**: Workload, Resource
type, Environment, Region, Instance. Project paths use
Tier1 (Workload) and Tier2 (Resource type); Tier3–Tier5
apply to CAF-style resource names or to the third directory
tier (Instance/suffix). Single source for CAF terms and
abbreviations: `shared/context/documentation/CAF_ALLOWLIST_SPEC.md`.

**CAF policy**: CAF document standard only; **non-major
resource types are spelled out** (no ad-hoc abbreviations).
Use only the allowlist and mapping in CAF_ALLOWLIST_SPEC.md
when generating or validating CAF-style names.

### Tier1 — Workload (scope)

Top-level directory: scope or workload. Allowed values
align with RULESET.md §E prefix (Todo/Layer/Context). Under
this project: **shared**, **system**, **module**, **component**,
and layer/context names per §E. Example: `system/` = system
workload.

### Tier2 — Resource type (domain)

Under `system/` the form is `system/<Tier2>/` (one folder
per domain). Tier2 = resource type / bounded context.
Consolidated: content (source + core + lexis), governance
(+ audit), infra (+ storage, batch).

| Tier2 (domain) | Responsibility                                                        |
| -------------- | --------------------------------------------------------------------- |
| app            | Route registration and auth                                           |
| content        | Source CRUD, extract; lexis entries; content item CRUD                |
| governance     | Scripts store, mutate, allowlist/ontology; audit log (e.g. e2e_runs)  |
| identity       | Actors + actor schedule (due, plan, items, review)                    |
| infra          | Postgres, SQL loader, schema/seed; KV storage; batch (e.g. dbListAll) |
| export         | Export and external output                                            |
| notification   | Notifications and alerts                                              |
| report         | Reports and aggregations                                              |
| sync           | Synchronization and replication                                       |
| workflow       | Workflow and process orchestration                                    |

### Tier3 — Environment

For **CAF-style resource names** only. Allowed values:
prod, dev, test, qa, stage. See CAF_ALLOWLIST_SPEC.md Tier3.
Project directory paths do not use an environment segment.

### Tier4 — Region

For **CAF-style resource names** only. Allowed values (e.g.
eastus, westeurope) in CAF_ALLOWLIST_SPEC.md Tier4. Not
used in project directory paths.

### Tier5 — Instance

- **In directory paths**: Third tier (suffix) under Tier2,
  e.g. subdomain folders. Max depth remains 3 (Tier1 →
  Tier2 → Tier5). Content and identity use Tier5 for
  subdomains (see table below).
- **In CAF resource names**: Numeric instance (2–4 digits).
  See CAF_ALLOWLIST_SPEC.md Tier5.

**TS filename** = default export name: camelCase for
functions/modules (e.g. `profileEndpoint.ts`,
`profileService.ts`), PascalCase for class/singleton; no
dot or hyphen in the filename. Aligns with RULESET.md §E/§F
and Airbnb-style naming (filename matches export).

### Artifact roles (no dot in filename)

Role is implied by export; filename = default export name.
Common patterns: endpoint (HTTP routes), service (use
cases), store (persistence), schema (Zod), client (API
wrapper), config (wiring). Use camelCase (e.g.
`profileEndpoint.ts`, `sourceExtractService.ts`). See
RULESET.md §E.

### Subdomains (system/Tier2/Tier5)

Under **content** and **identity**, Tier5 (third directory
tier) groups files by subdomain. Max depth remains 3
(Tier1 → Tier2 → Tier5).

| Tier2 (domain) | Tier5 (subdomains)                                                          |
| -------------- | --------------------------------------------------------------------------- |
| content        | material, item, instruction, assessment, review, recommend, diagnose       |
| identity       | actors, schedule, curriculum, achievement, outlook, briefing, analysis     |

### Domains and API paths (6 + App)

| Domain     | Role                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Core       | Content item CRUD at `/core/items`, `/core/items/:id`. Worksheet removed.                          |
| Identity   | actor_id, display_name, level, progress; list/search by name; schedule (due, plan, items, review). |
| Governance | Scripts, mutate, allowlist/ontology (data only). Core/Source use allowlist data only.              |
| Source     | Sources CRUD, `/sources/:id/extract`; lexis entries at `/lexis/entries`.                           |
| Storage    | Generic kv at `/kv`.                                                                               |
| Audit      | Event/audit log.                                                                                   |
| App        | Routing, auth, domain endpoint registration.                                                       |

**Actor model**: Server stores actor_id (PK), display_name,
level, progress (updated_at). API: GET/POST
/identity/actors, GET/PATCH /identity/actors/:id; list
supports query name/display_name. Schedule:
/identity/schedule/due, /identity/schedule/plan/weekly,
/identity/schedule/plan/annual, /identity/schedule/items,
/identity/schedule/items/:id/review.

**API path summary**: Identity: /identity/actors,
/identity/actors/:id, /identity/schedule/_. Governance:
/scripts, /scripts/:path_, /script/mutate. Source: /sources,
/sources/:id, /sources/:id/extract, /lexis/entries. Core:
/core/items, /core/items/:id. Storage: /kv.

### Target layout (Tier1 system — Tier2 domains + Tier5 subdomains)

```
system/                    (Tier1 = workload)
  app/                     (Tier2; routesRegisterConfig.ts, homeHandler.ts, openApiRoutes.ts, ...)
  content/                 (Tier2; Tier5: material/, item/, instruction/, assessment/, review/, recommend/, diagnose/; plus embeddingClient, utteranceParserService, ...)
  governance/              (Tier2; scriptsEndpoint, mutateEndpoint, conceptSchemes; ...)
  identity/                (Tier2; Tier5: actors/, schedule/, curriculum/, achievement/, outlook/, briefing/, analysis/; sql/)
  infra/                   (Tier2; pgClient, sqlLoader, storageEndpoint, ...)
  report/                  (Tier2; ...)
  routes.ts                (entry; imports app config)
```

### Test file names (tests/)

Under `tests/`, every `.ts` file must be `[name]_test.ts`
(Deno convention). The **name** part uses camelCase (e.g.
`scriptsStore_test.ts`, `sourceExtractEndpoint_test.ts`).
Non-test helpers (e.g. `with_temp_scripts_store.ts`) are
listed in PATH_EXCEPTIONS. Validated by
`deno task ts-filename-check`.

### TypeScript filename — To Do / Not To Do (WI-CODE-003)

Scope: `system/**/*.ts`, `tests/**/*.ts`,
`shared/context/scripts/*.ts`. Root `.ts`: ROOT_ALLOWED only
(e.g. main.ts, client.ts). PATH_EXCEPTIONS keep existing
names.

**To Do**

- **Filename format**: Default export = function or module →
  base name **camelCase** (e.g. `profileEndpoint.ts`,
  `weeklyWinService.ts`). Default export =
  class/constructor/singleton → base name **PascalCase**
  (e.g. `IdentityIndexStore.ts`).
- **Base name = default export name** (filename = default
  export symbol). Base name: letters and numbers only
  (`[a-zA-Z0-9]*`, camelCase or PascalCase). Verify with
  `deno task ts-filename-check`.
- **Symbol naming (§T)**: Types/interfaces/classes/Zod
  schema constants: PascalCase.
  Functions/methods/variables/parameters: camelCase.
  Default-export function/module name in camelCase = file
  base name.
- **One default export per file.** Split by role per
  MANUAL.md patterns (*Endpoint, *Service, *Store, *Schema,
  *Client, config).
- **New/refactor**: After adding or splitting files, run
  `deno task ts-filename-check`.
- **Tests**: `[name]_test.ts` with **name** in camelCase
  (e.g. `mainE2e_test.ts`). `shared/context/scripts/*.ts`:
  base name camelCase or PascalCase per §E.

**Not To Do**

- **Filename**: No hyphen or dot in base name (e.g. no
  `profile-endpoint.ts`, `profile.endpoint.ts`). Do not
  mismatch base name and default export (e.g. default
  `profileEndpoint` with file `profile.ts` or
  `ProfileEndpoint.ts` for a function). No PascalCase base
  for function/module files; no camelCase base for
  class/singleton files.
- **Structure**: No multiple default exports per file. No §T
  violations (e.g. default function in PascalCase, type in
  camelCase).
- **Validation**: Do not add ad-hoc exceptions for
  `system/`, `tests/`, `shared/context/scripts/`; use config
  only. Do not commit without passing
  `deno task ts-filename-check`.

**Summary**

| Area       | To Do                                                                                                    | Not To Do                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Filename   | default=function/module→camelCase; class/singleton→PascalCase; base=default export; letters/numbers only | hyphen/dot; filename≠default export; PascalCase for function file; camelCase for class file |
| Symbol     | Types/classes/schemas PascalCase; functions/variables camelCase                                          | Types camelCase; default function PascalCase                                                |
| Structure  | One default per file; role split per MANUAL.md                                                           | Multiple default exports                                                                    |
| Validation | ts-filename-check pass; exceptions in config only                                                        | Bypass check; add exceptions outside config                                                 |

### Naming conventions (content and level)

#### Content domain names (English learning data)

For structural names (tables, API paths, `source_id`
prefixes, `content_type_id`, seed paths, docs), use only
these three terms for English learning data:

| Domain name   | Use for                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **grammar**   | `source_id` prefix (e.g. `book-grammar-*`), grammar curriculum tables/schemas, content_type for grammar                              |
| **lexis**     | Table names (e.g. `lexis_entry`), `system/content/`, source_id prefix (e.g. `lexis-middle-basic`). Source list: `shared/infra/seed/material/material_sources.toml`. |
| **phonology** | Tables, APIs, `source_id`, content_type for pronunciation/phonetic data                                                              |

Do not use synonyms (e.g. vocabulary, pronunciation,
phonics) in structural names. The suffix **grammar** in §E
denotes parser/grammar rules (`*.grammar.ts`); the same word
as content domain means “English grammar data” (sources,
curriculum).

#### Difficulty / level (3 stages)

For curriculum, schedule, and source-level naming (e.g.
grammar books, word lists), use three stages in **lowercase
everywhere** (code, IDs, API values, DB, display):
**basic**, **intermediate**, **advanced**. This is a
documentation convention only; not a validated allowlist.

### Schema (DDL) file naming

DDL files under `shared/infra/schema/` use a fixed pattern
so execution order is clear and names align with RULESET.md
§E (lowercase, underscores, no hyphens).

**Rationale.** RULESET.md §E and §F define naming for
directories, documents, and TypeScript files only;
`deno task ts-filename-check` validates `.ts` files only.
DDL files had no explicit rule, so this section defines one:
keep two-digit execution order (NN) and use the same name
shape as §E (lowercase, one underscore between words, no
hyphens) for the `<name>` part.

- **Pattern**: `NN_<name>.sql`
  - **NN**: Two-digit number (00–99) for execution order.
    Preserved when adding migrations for the same domain
    (e.g. `02_source.sql`, `02_source_add_column.sql`).
  - **&lt;name&gt;**: Lowercase letters, digits, and underscores
    only. Same rule as segment naming:
    `^[a-z][a-z0-9]*(_[a-z0-9]+)*$`. No hyphens in name part.
- **Examples**: `01_actor.sql`, `02_source.sql`,
  `03_kv.sql`, `04_content.sql`, `06_ontology.sql` (concept
  scheme, concept, concept_relation).
- **Vocabulary**: Prefer names that match project axes (e.g.
  actor, content, source, kv). New domains: align with
  BACKLOG.md and this reference (allowed Tier2/Tier5 and §E).
- **Migration**: When renaming or adding DDL files, follow
  the migration boundary (RULESET.md §J): plan first, then
  apply renames and reference updates in one logical change.

**Application (example renames).** When aligning existing
filenames to this rule, change only the name part:
hyphens → underscores. Numeric prefix stays.

| Current (if present)         | Proposed (name per §E)         |
| ---------------------------- | ------------------------------ |
| `00_init.sql`                | `00_init.sql` (unchanged)      |
| `01_actor.sql`               | `01_actor.sql` (unchanged)    |
| `02_content.sql`             | `02_content.sql` (unchanged)  |
| `02_content-add-payload.sql` | `02_content_add_payload.sql`  |
| `03_source.sql`              | `03_source.sql` (unchanged)   |
| `04_kv.sql`                  | `04_kv.sql` (unchanged)        |
| `05_knowledge.sql`           | `05_knowledge.sql` (unchanged)|
| `06_task-queue.sql`         | `06_task_queue.sql`           |

New DDL (e.g. ontology): use `NN_<name>.sql` with an
available number and §E-compliant name; adjust numbering if
needed (see BACKLOG.md, §J, and this reference for allowed
Tier2/Tier5 and §E segment names).

**Validation (optional).** Script
`shared/context/scripts/checkSqlFilename.ts` checks all .sql
files: (1) `shared/infra/schema/*.sql` must match
`NN_<name>.sql` with name `^[a-z][a-z0-9]*(_[a-z0-9]+)*$`;
(2) `system/<module>/sql/*.sql` must be lowercase snake_case
(e.g. `get_schedule_item.sql`). Run:
`deno task sql-filename-check` (pre-commit or CI; see
RULESET.md §5).

### DML (queries)

Application DML lives under `system/<module>/sql/` (e.g.
`system/schedule/sql/`). One statement per file; filenames
lowercase snake_case (e.g. `get_schedule_item.sql`);
validated by sql-filename-check. Load with
`loadSql(baseUrl, filename)` from
`system/infra/sqlLoader.ts`; baseUrl typically
`new URL("./sql/", import.meta.url)`. Parameters: PostgreSQL
`$1, $2, ...`; document order/meaning in the .sql file or
store. DDL data: `shared/infra/schema/*.sql`. Seed data:
`shared/infra/seed/...`. Runners:
`system/infra/applySchema.ts`,
`system/governance/runSeedOntology.ts`,
`system/infra/runSeedMaterial.ts`.

### Migration mapping (3-layer → flat, completed)

| Old path (3-layer)                 | New path (flat)                   |
| ---------------------------------- | --------------------------------- |
| system/actor/endpoint/profile.ts   | system/actor/profileEndpoint.ts   |
| system/actor/service/profile.ts    | system/actor/profileService.ts    |
| system/actor/store/profile.ts      | system/actor/profileStore.ts      |
| system/content/endpoint/content.ts | system/content/contentEndpoint.ts |
| system/content/service/*.ts        | system/content/*.service.ts       |
| system/content/schema/*.ts         | system/content/*.schema.ts        |
| system/content/material            | service                           |
| system/script/endpoint             | service                           |
| system/record/endpoint             | identityIndexStore.ts             |
| system/kv/endpoint                 | store/kv.ts                       |
| system/governance/ (e2e_runs)      | system/governance/auditE2eRuns.ts |
| system/app/config/*.ts             | system/app/*.config.ts            |

### Data file locations (TOML)

| Path                                               | Purpose                                                                                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/record/reference/identity_index.toml`      | Identity index. API: full data when Entra Bearer token present.                                                                          |
| `system/governance/e2e_runs.toml`                 | E2E run log (schemaVersion + runs[])                                                                                                     |
| `shared/infra/seed/ontology/seed.sql`              | Ontology seed (reserved).                                                                                                                |
| `shared/infra/seed/ontology/global_standards.toml` | **Single definition** for concept schemes and concepts (isced, iscedf, bloom, cefr, actfl, doctype). Seed: `deno task seed:ontology`.    |
| `shared/infra/seed/grammar_unit_topics.toml`      | unit_id → topic_label for grammar item generation (POST /content/items/generate). Synced with grammar curriculum (see § Grammar topics). |
| `shared/infra/seed/curriculum-52weeks.json`        | Seed source for 52-week curriculum; runtime data in DB table `curriculum_slot`.                                                          |
| `shared/infra/seed/material/material_sources.toml` | Material source list (source_id, env_var). Actual metadata from .env (RULESET.md §V); `deno task seed:material`.                        |

**Not ontology**: Identity index, material sources (source metadata), curriculum
slots (52-week), grammar_unit_topics.toml, and client
identity are **not** concept schemes; they are reference or
runtime data. Only `global_standards.toml` (and any future
concept_relation TOML) defines the ontology.

### Curriculum (52 weeks)

52-week grid (3 units per week per level) is stored in DB
table `curriculum_slot`, seeded from
`shared/infra/seed/curriculum-52weeks.json`
(`deno task seed:curriculum`). Runtime: GET
/schedule/plan/annual (query `level`). Topic mapping: §
Grammar topics below. Weekly plan logic:
schedule-fsrs-plan.md.

### Curriculum external mapping API

POST `/identity/curriculum/external-mapping` returns a
mapping between the internal curriculum (52 weeks × 3 slots,
`unit_id`, `source_id`) and an external education standard
(e.g. Korean 2022 revised secondary math). **Response**:
`national_standard` (string), `level` (basic | intermediate
| advanced), `mappings` (array). Each mapping entry:
`internal` (unit_id required; optional week_number,
slot_index, source_id), `external` (code required; optional
label). When `save_to_file: true`, the mapping is written
under the path from `deno.json` key `infraMapping` (default
`shared/infra/mapping/`), filename
`{level}-{national_standard}.json`.

### Grammar topics (17 major topics)

Three books (basic, intermediate, advanced) are organized by
**study_guide** into **17 major topics**. Unit IDs:
`unit_1`, `unit_2`, … (metadata.unit_ids). Topics: Tense &
Time, Modals & Modality, Conditionals, Passive Voice,
Questions & Sentence Structure, Reporting, Comparison &
Contrast, Quantifiers & Determiners, Prepositions, Verb
Patterns, Nouns/Articles & Noun Phrases, Pronouns,
Conjunctions & Connectors, Adjectives & Adverbs,
Subject–Verb Agreement, Phrasal Verbs, Existential Clauses.
**By level**: basic — tense, modals, questions, comparison,
quantifiers, prepositions, existential, simple reporting;
intermediate — above extended, plus present perfect,
conditionals, passive, verb patterns, nouns/articles,
pronouns, conjunctions, phrasal verbs; advanced —
reporting/modality, S–V agreement, noun phrases,
adjectives/adverbs, prepositions with clauses,
questions/inversion. Schedule and grammar sources use
`metadata.unit_ids` in curriculum order.

### Ontology and facet policy

- **Single definition**: All concept schemes and concepts
  are defined only in
  `shared/infra/seed/ontology/global_standards.toml`. Code
  and docs derive from it; `deno task seed:ontology` loads
  into DB. Code must match TOML (CI:
  `deno task ontology-schemes-check`).
- **DAG**: The whole of `concept_relation` must form a DAG;
  there must be no cycles for any `relation_type` (e.g.
  broader, narrower, requires, depends-on). Run
  `deno task ontology-acyclic-check` to verify (e.g. after
  applying schema and seed).
- **Facet schemes**: Subject IDs use isced, iscedf. Content
  type, cognitive level, and context use their respective
  allowed schemes (see system/governance/conceptSchemes.ts).
  Content and worksheet APIs validate concept IDs per facet
  and cap at 500 per request.
- **CI**: `deno task pre-push` runs
  `ontology-schemes-check`. It does not run
  `ontology-acyclic-check`; after changing ontology seed or
  relations, run `deno task ontology-acyclic-check`
  manually.

### Classification allowlists (4 facets)

**Canonical source**:
`shared/infra/seed/ontology/global_standards.toml`. The
lists below are a summary; the TOML (and DB after seed) is
the authority. Runtime:
`system/governance/conceptSchemes.ts` maps each facet to
scheme(s); content and (when implemented) source APIs reject
values not in the allowlist.

**Facet → scheme mapping**

| Facet                 | Schemes       | Standard                                 |
| --------------------- | ------------- | ---------------------------------------- |
| Subject               | isced, iscedf | ISCED 2011 (level), ISCED-F 2013 (field) |
| DocType (contentType) | doctype       | Schema.org / BibTeX                      |
| Cognitive             | bloom         | Bloom's taxonomy (revised)               |
| Proficiency (context) | cefr, actfl   | CEFR, ACTFL                              |

**Allowed codes per scheme (canonical list in
global_standards.toml)**

- **isced**: isced-0 … isced-8 (Early childhood … Doctoral).
- **iscedf**: iscedf-00 … iscedf-10 (Generic programmes …
  Services).
- **bloom**: bloom-1 … bloom-6 (Remember … Create).
- **cefr**: cefr-a1, cefr-a2, cefr-b1, cefr-b2, cefr-c1,
  cefr-c2.
- **actfl**: actfl-n, actfl-nl, actfl-nm, actfl-nh, actfl-i,
  actfl-il, actfl-im, actfl-ih, actfl-a, actfl-al, actfl-am,
  actfl-ah, actfl-s.
- **doctype**: book, article, news-article, video-object,
  web-page; inproceedings, techreport, manual, unpublished,
  misc (BibTeX).

When adding or editing items, sources, or any payload that
uses concept IDs (subject_ids, content_type_id,
cognitive_level_id, context_ids, document_type, concept_id):
use only these codes. Do not invent new codes; add new
values only by updating global_standards.toml and re-running
`deno task seed:ontology`.

### Modular monolith rules

- Within a domain: endpoint → service → store/schema only.
- Cross-domain: do not import another domain's store; use
  that domain's service if needed.
- app/*.config.ts and *.handler.ts only import domain
  endpoints and register routes; no business logic.
- Postgres: `system/infra/pgClient.ts` provides `getPg()`.
  Domain stores and system/kv use it; no KV or other storage
  client.

### Per-domain public API

When importing from another domain (or from app), use only
the **public entry** files listed below. Do not import
internal implementation files (e.g. \*Store, \*LlmCall,
\*Service) of another domain; use that domain's endpoint or
documented service API.

| Domain / subdomain   | Public entry (file or export)                                                                                       | Used by                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| report               | \*Endpoint.ts (bottleneck, anomaly, cohortWeaknessHeatmap, pacingDeviation, …), teamBriefingViewEndpoint            | app (route registration) |
| identity/actors      | actorsEndpoint.ts                                                                                                   | app                      |
| identity/schedule    | scheduleEndpoint.ts                                                                                                 | app                      |
| identity/achievement | achievementEndpoint.ts                                                                                              | app                      |
| identity/curriculum  | curriculumMappingEndpoint.ts                                                                                        | app                      |
| identity/outlook     | \*Endpoint.ts (positiveReinforcement, weeklyWin, …)                                                                 | app                      |
| identity/briefing    | actorBriefingViewEndpoint.ts                                                                                        | app                      |
| identity/analysis    | identityAnalysisOpenApi.ts                                                                                          | app (OpenAPI)            |
| content/bank         | endpoint.ts                                                                                                         | app                      |
| content/assessment   | assessmentPromptContextEndpoint.ts, assessmentEngineOpenApi.ts, assessmentEvaluationOpenApi.ts                      | app                      |
| content/review       | reviewMappingEndpoint.ts                                                                                            | app                      |
| content/material     | sourceEndpoint.ts, dashboardViewEndpoint.ts, lexisEndpoint.ts                                                       | app                      |
| content/instruction  | \*Endpoint.ts (differentiated, examBlueprint, …)                                                                    | app                      |
| content/recommend    | recommendationsEndpoint.ts, semanticRecommendEndpoint.ts, semanticItemRecommendEndpoint.ts, ragRecommendEndpoint.ts | app                      |
| content/diagnose     | diagnoseOpenApi.ts                                                                                                  | app (OpenAPI)            |
| governance           | mutateEndpoint.ts, scriptsEndpoint.ts, governanceAssessmentOpenApi.ts, governanceOntologyOpenApi.ts                 | app                      |
| infra                | storageEndpoint.ts                                                                                                  | app                      |

### Vertical slice and cross-slice rules

- **Slice**: One subdomain folder (e.g. content/recommend,
  identity/schedule) is one vertical slice. That folder
  contains endpoint, service, store, schema for that
  capability.
- **Inside a slice**: endpoint → service → store/schema
  only. No direct store access from outside the slice.
- **Cross-slice**: Call another domain or subdomain only via
  its **service** or public API (see Per-domain public API).
  Do not import another slice's store or internal
  implementation files.
- **Exceptions**: shared/, system/infra, and governance
  (allowlist data) follow the existing dependency matrix.

### Domain dependency (acyclic; data coupling)

Cross-domain service calls must not form a cycle. Identity,
Storage, Audit do not call other domains. Governance
provides allowlist **data** only; Core and Source use that
data. Identity may depend on Source (schedule).

**Hierarchy**

- **App**: Registers routes only; no business logic.
- **Identity, Storage, Audit**: Identity may call Source;
  Storage/Audit no outgoing domain calls.
- **Governance**: Provides allowlist data only. No calls to
  Identity/Source/Core.
- **Core, Source**: Use allowlist from Governance only.
  Allowed: core → governance, source → governance, identity
  → governance, identity → source.

**Allowed dependency matrix**

Rows = importer; columns = imported. Only data/types or
explicit allowed service; no store cross-import.

| From \\ To | identity | governance | content | report | source  | core | storage | audit |
| ---------- | -------- | ---------- | ------- | ------ | ------- | ---- | ------- | ----- |
| identity   | —        | no         | no      | no     | allowed | no   | no      | no    |
| governance | no       | —          | no      | no     | no      | no   | no      | no    |
| content    | no       | data only  | —       | no     | no      | no   | no      | no    |
| report     | allowed  | allowed    | no      | —      | no      | no   | no      | no    |
| source     | no       | data only  | no      | no     | —       | no   | no      | no    |
| core       | no       | data only  | no      | no     | no      | —    | no      | no    |
| storage    | no       | no         | no      | no     | no      | no   | —       | no    |
| audit      | no       | no         | no      | no     | no      | no   | no      | —     |

When adding a cross-domain dependency: (1) ensure acyclic;
(2) update this matrix and
`shared/context/scripts/checkDomainDeps.ts`; (3) then
implement.

---

## TypeScript symbol naming (§T)

Rules are in RULESET.md §T. This section gives examples and
exceptions from `system/` and shared scripts.

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

- **Default**: camelCase for new domains (e.g. `createdAt`,
  `updatedAt` in `system/actor/profileSchema.ts`).
- **Exception**: snake_case when the shape is dictated by an
  external API or persistence contract; document in the file
  (e.g. "API/DB contract"). Example:
  `system/content/contentSchema.ts` uses `item_id`,
  `created_at`, `worksheet_id` for stored/API payload shape.

### §P pattern guide (function body 2–4 statements)

RULESET.md §P limits block bodies to 2–4 AST statements. For
single-responsibility, naming (no And/Or/If; register per
domain), and split patterns (load/transform/save, validate
vs persist), see ACTION.md § Function responsibility and
split. A single statement is allowed when it is try/catch,
switch, or block-bodied if (complex-statement exemption).
Prefer small functions and delegation so each body stays
within the limit.

**Avoid** (procedural, too many statements in one body):

```ts
function validateSqlFiles(files: string[]) {
  const invalidFiles = [];
  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    if (!checkNamingRule(file)) invalidFiles.push(file);
  }
  if (invalidFiles.length > 0) throw new Error('Invalid');
  return true;
}
```

**Prefer** (functional pipeline; 2–4 statements per body):

```ts
function validateSqlFiles(files: string[]): boolean {
  const sqlFiles = files.filter(isSqlExtension);
  const invalidFiles = sqlFiles.filter(isInvalidNaming);
  return checkAndThrow(invalidFiles);
}
```

**Use complex-statement exemption** when a single guard is
enough (e.g. throw if invalid):

```ts
function ensureValidName(filename: string): void {
  if (!REGEX_SQL_NAME.test(filename)) {
    throw new Error(`Invalid SQL file name: ${filename}`);
  }
}
```
