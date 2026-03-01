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
- **Contract**: openapi.yaml and application/routes.ts define
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
  application/routes.ts listed in openapi.yaml);
  `deno task type-check-policy` (no type-check bypass).
  Modules and infrastructure: BACKLOG.md.

---

## Path config (config/path-config.json)

Directory and key file paths are defined in
`config/path-config.json` under the key `paths`. Use
`sharepoint/context/scripts/pathConfig.ts`: `getPath(key)`
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

### Next steps (structure)

- **path-config**: Unused path keys removed or directories
  created; pathConfig.ts PathKey kept in sync.
- **CAF allowlist** (structureAddDirConfigSetsData.ts) is for
  Azure resource naming only.
- **Optional**: Directory rename per §J — maintain a
  current→target path mapping table before bulk renames.

---

## System structure (CAF 5-axis · 5 components)

Directory and resource naming align to the **CAF (Cloud
Adoption Framework) 5-axis model**, which follows Azure
Resource Manager (ARM) naming concepts: Workload, resource
type, Environment, Region, Instance. Project paths use
Component 1 (Workload) and Component 2 (resource type);
Component 3–5 (environment, region, instance) use the same
CAF allowlist when used as directory or resource segments.
Single source for CAF terms: this manual § CAF allowlist
specification.

**CAF policy**: CAF document standard only; **non-major
resource types are spelled out** (no ad-hoc abbreviations).
Use only the allowlist and mapping in this manual § CAF
allowlist specification when generating or validating
CAF-style names.

**5-component directory roles (summary)**. Max depth is **5
components** (Component 1 → Component 2 → … → Component 5);
root is not counted. Segment names at each level use **only**
the CAF allowlist for that component (see § CAF allowlist
specification below). **Component 1** = workload. **Component 2** =
resource type (major as-is, non-major full form). **Component 3** =
environment (prod, dev, test, qa, stage). **Component 4** =
region. **Component 5** = optional instance or numeric suffix
(4 digits, e.g. 0001).

### Component 1 — Workload (scope)

Top-level directory: scope or workload. Allowed values from
§ CAF allowlist specification (Component 1) only; canonical
data: `pipeline/structureAddDirConfigSetsData.ts`
COMPONENT1_WORKLOAD.

### Component 2 — Resource type

Second segment: resource type. Allowed values from § CAF
allowlist specification (Component 2) only; canonical data:
`pipeline/structureAddDirConfigSetsData.ts`
COMPONENT2_RESOURCE_TYPE. Non-major types use full form
(one underscore between words).

### Component 3 — Environment

Allowed values from § CAF allowlist specification (Component 3)
only (prod, dev, test, qa, stage). Project directory paths
do not use environment as a segment.

### Component 4 — Region

Allowed values from § CAF allowlist specification (Component 4)
only. Not used as a segment in project directory paths.

### Component 5 — Instance

Optional instance or numeric suffix (4 digits per CAF). See
§ CAF allowlist specification (Component 5).

### CAF allowlist specification

This subsection is the **single reference** for all CAF (Cloud Adoption Framework) terminology and abbreviations used in this project. WP1, WP2, and WP3 use this spec as input. No other CAF word lists or abbreviation tables should be used.

**Principle**: CAF document standard only; non-major resource types are **spelled out** (no ad-hoc abbreviations).

**Prose terminology**: In documentation, use Azure Resource Manager (ARM) terms: **resource group**, **resource type**, **resource provider**, **management group**, **subscription**, **type segment**. Segment values in this spec (e.g. `resource_group`) stay lowercase; use one underscore between words; they denote the name segment only.

**Source**: [Azure Resource Manager – Resource naming rules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-name-rules), [Microsoft CAF – Resource naming](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming), [Resource abbreviations](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations).

#### Component 1 — Allowed words (CAF naming components)

Allowed terms for workload, application, or project names and general naming components. Use **only** these when generating or validating CAF-style names.

| Term | Use |
|------|-----|
| analytics | Data / analytics workload |
| application | Application scope |
| api | API / backend workload |
| auth | Auth / security workload |
| backend | API / backend workload |
| billing | API / backend workload |
| client | Client application or component |
| dashboard | Web / front workload |
| emissions | Example workload (CAF doc) |
| gateway | API / backend workload |
| hadoop | Example workload (CAF doc) |
| identity | Auth / security workload |
| ingest | Batch / job workload |
| navigator | Example workload (CAF doc) |
| orders | API / backend workload |
| pipeline | Data / analytics workload |
| portal | Web / front workload |
| reporting | Data / analytics workload |
| scheduler | Batch / job workload |
| sharepoint | Example workload (CAF doc) |
| shared | Shared / common workload |
| sso | Auth / security workload |
| storefront | Web / front workload |
| sync | Batch / job workload |
| web | Web / front workload |
| warehouse | Data / analytics workload |
| worker | Batch / job workload |

**Rule**: To add terms, update this table and get team agreement; then treat as final.

#### Component 2 — Resource type abbreviations

**Major (keep as-is)** — retained in resource names:

| Abbreviation | Meaning |
|--------------|---------|
| app | Web app |
| redis | Azure Cache for Redis |
| sql | Azure SQL Database server |
| test | Environment / test |
| prod | Production |
| dev | Development |
| qa | Quality assurance |
| stage | Staging |
| config | Configuration |
| log | Log Analytics workspace |

**Non-major (spell out)** — use full form in generated names; mapping abbreviation → full form:

| Abbreviation | Full form |
|--------------|-----------|
| rg | resource_group *(prose: resource group)* |
| st | storage |
| vm | virtual_machine |
| vnet | virtual_network |
| func | function |
| sqldb | sql_database |
| kv | key_vault |
| nic | network_interface |
| nsg | network_security_group |
| pip | public_ip |
| vgw | virtual_network_gateway |
| snet | subnet |
| cosmos | cosmos_db |
| adf | data_factory |
| evh | event_hub |
| sbns | service_bus_namespace |
| sbq | service_bus_queue |
| sbt | service_bus_topic |
| apim | api_management |
| cr | container_registry |
| aks | kubernetes_service |
| mysql | mysql_database |
| psql | postgresql |
| sqlmi | sql_managed_instance |
| dls | datalake_store |
| synw | synapse_workspace |
| mlw | machine_learning_workspace |
| oai | openai |
| appi | application_insights |
| ase | app_service_environment |
| asp | app_service_plan |
| vmss | virtual_machine_scale_set |
| pl | private_link |
| pep | private_endpoint |
| afw | azure_firewall |
| agw | application_gateway |
| rsv | recovery_services_vault |
| mg | management_group |
| ts | template_spec |
| aa | automation_account |
| logic | logic_app |
| ia | integration_account |
| bot | bot_service |
| srch | search |
| map | maps |
| sigr | signalr |
| wps | web_pub_sub |

**Rule**: Any CAF abbreviation not listed in **Major (keep as-is)** is treated as non-major and must be spelled out using this table (or added here after review).

#### Component 3 — Environment values

Allowed environment segment values. Use **only** these for the environment component.

| Value | Meaning |
|-------|---------|
| prod | Production |
| dev | Development |
| test | Test |
| qa | Quality assurance |
| stage | Staging |

#### Component 4 — Region (CAF example list)

Allowed region segment values for CAF-style names. This list is the **CAF example set**; the full Azure region list is in [Azure regions](https://learn.microsoft.com/en-us/azure/reliability/regions-list).

| Code | Description |
|------|-------------|
| east_us | East US |
| east_us_2 | East US 2 |
| west_us | West US |
| west_us_2 | West US 2 |
| west_us_3 | West US 3 |
| central_us | Central US |
| south_central_us | South Central US |
| north_central_us | North Central US |
| west_europe | West Europe |
| north_europe | North Europe |
| uk_south | UK South |
| france_central | France Central |
| germany_west_central | Germany West Central |
| canada_central | Canada Central |
| brazil_south | Brazil South |
| australia_east | Australia East |
| southeast_asia | Southeast Asia |
| east_asia | East Asia |
| japan_east | Japan East |
| korea_central | Korea Central |

**Note**: CAF docs also mention short forms such as `usva`, `ustx` for some scenarios; if used, add them to this table after team agreement.

#### Component 5 — Numeric pattern

Instance or identifier suffix in resource names.

| Pattern | Description | Example |
|---------|-------------|---------|
| 4 digits | Instance number | `0001`, `0002` |

**Rule**: Only numeric digits; exactly 4 characters. Use leading zeros for consistency (e.g. `0001`, `0002`).

*CAF allowlist spec version 1.0 (draft until team agreement). WP1–WP3 reference this manual as the single input for CAF allowlist and abbreviation mapping.*

---

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

### Test file names (tests/)

Under `tests/`, every `.ts` file must be `[name]_test.ts`
(Deno convention). The **name** part uses camelCase (e.g.
`scriptsStore_test.ts`, `sourceExtractEndpoint_test.ts`).
Non-test helpers (e.g. under tests/) are allowed without
`_test` suffix. Validated by `deno task ts-filename-check`.

### TypeScript filename — To Do / Not To Do (WI-CODE-003)

Scope: `application/**/*.ts`, `tests/**/*.ts`,
`sharepoint/context/scripts/*.ts`. Root and system root `.ts`:
base name camelCase/PascalCase or `*.d.ts`; root may contain
a dot (e.g. vite.config.ts).

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
  (e.g. `mainE2e_test.ts`). `sharepoint/context/scripts/*.ts`:
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
- **Validation**: Do not bypass ts-filename-check. Do not
  commit without passing `deno task ts-filename-check`.

**Summary**

| Area       | To Do                                                                                                    | Not To Do                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Filename   | default=function/module→camelCase; class/singleton→PascalCase; base=default export; letters/numbers only | hyphen/dot; filename≠default export; PascalCase for function file; camelCase for class file |
| Symbol     | Types/classes/schemas PascalCase; functions/variables camelCase                                          | Types camelCase; default function PascalCase                                                |
| Structure  | One default per file; role split per MANUAL.md                                                           | Multiple default exports                                                                    |
| Validation | ts-filename-check pass                                                                                  | Bypass check                                                                               |

### Naming conventions (content and level)

#### Content domain names (English learning data)

For structural names (tables, API paths, `source_id`
prefixes, `content_type_id`, seed paths, docs), use only
these three terms for English learning data:

| Domain name   | Use for                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **grammar**   | `source_id` prefix (e.g. `book-grammar-*`), grammar curriculum tables/schemas, content_type for grammar                              |
| **lexis**     | Table names (e.g. `lexis_entry`), `application/content/`, source_id prefix (e.g. `lexis-middle-basic`). Source list: `sharepoint/infra/seed/material/material_sources.toml`. |
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

DDL files under `sharepoint/infra/schema/` use a fixed pattern
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
  BACKLOG.md and this reference (CAF allowlist and §E).
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
CAF allowlist and §E segment names).

**Validation (optional).** Script
`sharepoint/context/scripts/checkSqlFilename.ts` checks all .sql
files: (1) `sharepoint/infra/schema/*.sql` must match
`NN_<name>.sql` with name `^[a-z][a-z0-9]*(_[a-z0-9]+)*$`;
(2) `application/<module>/sql/*.sql` must be lowercase snake_case
(e.g. `get_schedule_item.sql`). Run:
`deno task sql-filename-check` (pre-commit or CI; see
RULESET.md §5).

### DML (queries)

Application DML lives under `application/<module>/sql/` (e.g.
`application/schedule/sql/`). One statement per file; filenames
lowercase snake_case (e.g. `get_schedule_item.sql`);
validated by sql-filename-check. Load with
`loadSql(baseUrl, filename)` from
`application/infra/sqlLoader.ts`; baseUrl typically
`new URL("./sql/", import.meta.url)`. Parameters: PostgreSQL
`$1, $2, ...`; document order/meaning in the .sql file or
store. DDL data: `sharepoint/infra/schema/*.sql`. Seed data:
`sharepoint/infra/seed/...`. Runners:
`application/infra/applySchema.ts`,
`application/governance/runSeedOntology.ts`,
`application/infra/runSeedMaterial.ts`.

### Migration mapping (3-layer → flat, completed)

| Old path (3-layer)                 | New path (flat)                   |
| ---------------------------------- | --------------------------------- |
| application/actor/endpoint/profile.ts   | application/actor/profileEndpoint.ts   |
| application/actor/service/profile.ts    | application/actor/profileService.ts    |
| application/actor/store/profile.ts      | application/actor/profileStore.ts      |
| application/content/endpoint/content.ts | application/content/contentEndpoint.ts |
| application/content/service/*.ts        | application/content/*.service.ts       |
| application/content/schema/*.ts         | application/content/*.schema.ts        |
| application/content/material            | service                           |
| application/script/endpoint             | service                           |
| application/record/endpoint             | identityIndexStore.ts             |
| application/kv/endpoint                 | store/kv.ts                       |
| application/governance/ (e2e_runs)      | application/governance/auditE2eRuns.ts |
| application/app/config/*.ts             | application/app/*.config.ts            |

### Data file locations (TOML)

| Path                                               | Purpose                                                                                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `sharepoint/record/reference/identity_index.toml`      | Identity index. API: full data when Entra Bearer token present.                                                                          |
| `application/governance/e2e_runs.toml`                 | E2E run log (schemaVersion + runs[])                                                                                                     |
| `sharepoint/infra/seed/ontology/seed.sql`              | Ontology seed (reserved).                                                                                                                |
| `sharepoint/infra/seed/ontology/global_standards.toml` | **Single definition** for concept schemes and concepts (isced, iscedf, bloom, cefr, actfl, doctype). Seed: `deno task seed:ontology`.    |
| `sharepoint/infra/seed/grammar_unit_topics.toml`      | unit_id → topic_label for grammar item generation (POST /content/items/generate). Synced with grammar curriculum (see § Grammar topics). |
| `sharepoint/infra/seed/curriculum-52weeks.json`        | Seed source for 52-week curriculum; runtime data in DB table `curriculum_slot`.                                                          |
| `sharepoint/infra/seed/material/material_sources.toml` | Material source list (source_id, env_var). Actual metadata from .env (RULESET.md §V); `deno task seed:material`.                        |

**Not ontology**: Identity index, material sources (source metadata), curriculum
slots (52-week), grammar_unit_topics.toml, and client
identity are **not** concept schemes; they are reference or
runtime data. Only `global_standards.toml` (and any future
concept_relation TOML) defines the ontology.

### Curriculum (52 weeks)

52-week grid (3 units per week per level) is stored in DB
table `curriculum_slot`, seeded from
`sharepoint/infra/seed/curriculum-52weeks.json`
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
`sharepoint/infra/mapping/`), filename
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
  `sharepoint/infra/seed/ontology/global_standards.toml`. Code
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
  allowed schemes (see application/governance/conceptSchemes.ts).
  Content and worksheet APIs validate concept IDs per facet
  and cap at 500 per request.
- **CI**: `deno task pre-push` runs
  `ontology-schemes-check`. It does not run
  `ontology-acyclic-check`; after changing ontology seed or
  relations, run `deno task ontology-acyclic-check`
  manually.

### Classification allowlists (4 facets)

**Canonical source**:
`sharepoint/infra/seed/ontology/global_standards.toml`. The
lists below are a summary; the TOML (and DB after seed) is
the authority. Runtime:
`application/governance/conceptSchemes.ts` maps each facet to
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
- Postgres: `application/infra/pgClient.ts` provides `getPg()`.
  Domain stores and application/kv use it; no KV or other storage
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
- **Exceptions**: sharepoint/, application/infra, and governance
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
`sharepoint/context/scripts/checkDomainDeps.ts`; (3) then
implement.

---

## TypeScript symbol naming (§T)

Rules are in RULESET.md §T. This section gives examples and
exceptions from `application/` and shared scripts.

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
  `updatedAt` in `application/actor/profileSchema.ts`).
- **Exception**: snake_case when the shape is dictated by an
  external API or persistence contract; document in the file
  (e.g. "API/DB contract"). Example:
  `application/content/contentSchema.ts` uses `item_id`,
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
