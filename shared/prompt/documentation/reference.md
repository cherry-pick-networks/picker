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

| Infix        | Responsibility                                                                             |
| ------------ | ------------------------------------------------------------------------------------------ |
| actor        | Profile, progress (identity and state)                                                     |
| app          | Route registration and app wiring                                                          |
| audit        | Change/run log artifacts                                                                   |
| batch        | Batch jobs and bulk operations                                                             |
| concept      | Concept scheme, concept, concept_relation (ontology)                                       |
| content      | Items, worksheets, prompt building                                                         |
| data         | Data access / identity index (e.g. record/data)                                            |
| export       | Export and external output                                                                 |
| kv           | Generic key-value HTTP API; Postgres-backed, client from shared/infra.                     |
| notification | Notifications and alerts                                                                   |
| record       | Identity index (shared/record/reference)                                                   |
| report       | Reports and aggregations                                                                   |
| schedule     | FSRS schedule (in-house); weekly plan (3 sessions/week) and annual curriculum from grammar |
| script       | Scripts store, AST apply, Governance                                                       |
| source       | Source collection and read                                                                 |
| sync         | Synchronization and replication                                                            |
| workflow     | Workflow and process orchestration                                                         |

### Allowed suffix (artifacts)

| Suffix     | Meaning                               | §E axis  |
| ---------- | ------------------------------------- | -------- |
| adapter    | External/system adapter               | Artifact |
| client     | Client wrapper (e.g. KV, API)         | Artifact |
| config     | Wiring (e.g. route registration)      | Artifact |
| endpoint   | HTTP entry (Hono routes)              | Artifact |
| event      | Domain/application events             | Artifact |
| format     | Serialization/format handling         | Artifact |
| grammar    | Parser/grammar rules                  | Artifact |
| log        | Log artifact storage                  | Meta     |
| mapper     | Row/DTO mapping                       | Artifact |
| mapping    | Mapping definitions                   | Artifact |
| pipeline   | Processing pipeline                   | Artifact |
| request    | Request DTO/schema                    | Artifact |
| response   | Response DTO/schema                   | Artifact |
| schema     | Zod schemas and domain types          | Artifact |
| service    | Application service (use cases)       | —        |
| store      | Persistence (KV, file)                | Artifact |
| transfer   | Request/response or DTO types         | Artifact |
| types      | Type-only definitions                 | Meta     |
| validation | Policy/verification (e.g. Governance) | Policy   |
| weekly     | Weekly view / period-specific logic   | Meta     |

### Target layout (flat domain: files under system/<infix>/)

```
system/
  actor/     *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts, *.parser.ts
  app/       *.config.ts, *.handler.ts, *.util.ts
  audit/     audit-e2e-runs.ts
  concept/   *.service.ts, *.store.ts, concept-schemes.ts
  content/   *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts
  kv/        *.endpoint.ts, *.store.ts
  record/    *.endpoint.ts, *.store.ts
  schedule/  *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, fsrs.ts, *.grammar.ts, *.mapper.ts, *.weekly.ts, *.adapter.ts, *-annual.service.ts
  script/    *.endpoint.ts, *.service.ts, *.store.ts, *.types.ts, *.validation.ts
  source/    *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, source-extract.service.ts, source-llm.client.ts
  routes.ts  (entry; imports app/routes-register.config.ts)
```

### Test file names (tests/)

Under `tests/`, every `.ts` file must be `[name]_test.ts` (Deno convention). The
**name** part must use lowercase and hyphens only (§E), e.g.
`scripts-store_test.ts`. Non-test helpers (e.g. `with_temp_scripts_store.ts`)
are listed in PATH_EXCEPTIONS. Validated by `deno task ts-filename-check`.

### Naming conventions (content and level)

#### Content domain names (English learning data)

For structural names (tables, API paths, `source_id` prefixes,
`content_type_id`, seed paths, docs), use only these three terms for English
learning data:

| Domain name   | Use for                                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **grammar**   | `source_id` prefix (e.g. `book-grammar-*`), grammar curriculum tables/schemas, content_type for grammar                            |
| **lexis**     | Table names (e.g. `lexis_entry`), `system/lexis/`, seed `shared/infra/seed/lexis/`, `source_id` prefix (e.g. `lexis-middle-basic`) |
| **phonology** | Tables, APIs, `source_id`, content_type for pronunciation/phonetic data                                                            |

Do not use synonyms (e.g. vocabulary, pronunciation, phonics) in structural
names. The suffix **grammar** in §E denotes parser/grammar rules
(`*.grammar.ts`); the same word as content domain means “English grammar data”
(sources, curriculum).

#### Difficulty / level (3 stages)

For curriculum, schedule, and source-level naming (e.g. grammar books, word
lists), use three stages in **lowercase everywhere** (code, IDs, API values, DB,
display): **basic**, **intermediate**, **advanced**. This is a documentation
convention only; not a validated allowlist.

### Schema (DDL) file naming

DDL files under `shared/infra/schema/` use a fixed pattern so execution order is
clear and names align with store.md §E (lowercase, hyphens, no underscores).

**Rationale.** store.md §E and §F define naming for directories, documents, and
TypeScript files only; `deno task ts-filename-check` validates `.ts` files only.
DDL files had no explicit rule, so this section defines one: keep two-digit
execution order (NN) and use the same name shape as §E (lowercase, one hyphen
between words, no underscores) for the `<name>` part.

- **Pattern**: `NN_<name>.sql`
  - **NN**: Two-digit number (00–99) for execution order. Preserved when adding
    migrations for the same domain (e.g. `02_source.sql`,
    `02_source-add-column.sql`).
  - **&lt;name&gt;**: Lowercase letters, digits, and hyphens only. Same rule as
    the TS filename _name_ part: `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`. No
    underscores.
- **Examples**: `01_actor.sql`, `02_source.sql`, `03_kv.sql`, `04_content.sql`,
  `06_ontology.sql` (concept scheme, concept, concept_relation).
- **Vocabulary**: Prefer names that match project axes (e.g. actor, content,
  source, kv). New domains: align with todo.md and this reference (allowed
  infix/suffix).
- **Migration**: When renaming or adding DDL files, follow the migration
  boundary (store.md §J): plan first, then apply renames and reference updates
  in one logical change.

**Application (example renames).** When aligning existing filenames to this
rule, change only the name part: underscores → hyphens. Numeric prefix stays.

| Current (if present)         | Proposed (name per §E)         |
| ---------------------------- | ------------------------------ |
| `00_init.sql`                | `00_init.sql` (unchanged)      |
| `01_actor.sql`               | `01_actor.sql` (unchanged)     |
| `02_content.sql`             | `02_content.sql` (unchanged)   |
| `02_content_add_payload.sql` | `02_content-add-payload.sql`   |
| `03_source.sql`              | `03_source.sql` (unchanged)    |
| `04_kv.sql`                  | `04_kv.sql` (unchanged)        |
| `05_knowledge.sql`           | `05_knowledge.sql` (unchanged) |
| `06_task_queue.sql`          | `06_task-queue.sql`            |

New DDL (e.g. ontology): use `NN_<name>.sql` with an available number and
§E-compliant name; adjust numbering if needed (see todo.md and §J).

**Validation (optional).** Script `shared/prompt/scripts/check-sql-filename.ts`
checks all .sql files: (1) `shared/infra/schema/*.sql` must match
`NN_<name>.sql` with name `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`; (2)
`system/<module>/sql/*.sql` must be lowercase snake_case (e.g.
`get_schedule_item.sql`). Run: `deno task sql-filename-check` (pre-commit or CI;
see store.md §5).

### DML (queries)

Application DML lives under `system/<module>/sql/` (e.g.
`system/schedule/sql/`). One statement per file; filenames lowercase snake_case
(e.g. `get_schedule_item.sql`); validated by sql-filename-check. Load with
`loadSql(baseUrl, filename)` from `shared/infra/sql-loader.ts`; baseUrl
typically `new URL("./sql/", import.meta.url)`. Parameters: PostgreSQL
`$1, $2, ...`; document order/meaning in the .sql file or store. DDL:
`shared/infra/schema/*.sql`. Seed: `shared/infra/seed/...`.

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
| system/record/endpoint             | identity-index.store.ts            |
| system/kv/endpoint                 | store/kv.ts                        |
| system/audit/log/log.ts            | system/audit/audit-e2e-runs.ts     |
| system/app/config/*.ts             | system/app/*.config.ts             |

### Data file locations (TOML)

| Path                                               | Purpose                                                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `shared/record/reference/identity-index.toml`      | Identity index. API: redacted unless X-Client: agent.                                                    |
| `system/audit/e2e-runs.toml`                       | E2E run log (schemaVersion + runs[])                                                                     |
| `shared/infra/seed/ontology/seed.sql`              | Ontology seed (DDC scheme).                                                                              |
| `shared/infra/seed/ontology/global-standards.toml` | Ontology seed: isced, iscedf, bloom (no CEFR/PISA).                                                      |
| `shared/prompt/documentation/grammar-topics.md`    | Grammar curriculum: 17 major topics, level→unit mapping (schedule/content).                              |
| `shared/infra/seed/curriculum-52weeks.json`        | Seed source for 52-week curriculum; runtime data in DB table `curriculum_slot`.                          |
| `shared/infra/seed/lexis/lexis-sources.toml`       | Lexis source list (source_id, env_var). Actual metadata from .env (store.md §V); `deno task seed:lexis`. |

### Curriculum (52 weeks)

52-week grid (3 units per week per level) is stored in DB table
`curriculum_slot`, seeded from `shared/infra/seed/curriculum-52weeks.json`
(`deno task seed:curriculum`). Runtime: GET /schedule/plan/annual (query
`level`). Topic mapping: grammar-topics.md. Weekly plan logic:
schedule-fsrs-plan.md.

### Ontology and facet policy

- **DAG**: The whole of `concept_relation` must form a DAG; there must be no
  cycles for any `relation_type` (e.g. broader, narrower, requires, depends-on).
  Run `deno task ontology-acyclic-check` to verify (e.g. after applying schema
  and seed).
- **Facet schemes**: Subject IDs use allowed schemes (ddc, isced, iscedf).
  Content type, cognitive level, and context use their respective allowed
  schemes (see system/concept/concept-schemes.ts). Content and worksheet APIs
  validate concept IDs per facet and cap at 500 per request.
- **CI**: `deno task pre-push` does not run `ontology-acyclic-check`. After
  running `deno task seed:ontology`, run `deno task ontology-acyclic-check`
  manually when changing ontology seed or relations.

### Classification allowlists (4 facets)

Single source for allowed concept codes:
`shared/infra/seed/ontology/global-standards.toml`. Runtime validation:
`system/concept/concept-schemes.ts` maps each facet to scheme(s); content and
(when implemented) source APIs reject values not in the allowlist.

**Facet → scheme mapping**

| Facet                 | Schemes       | Standard                                 |
| --------------------- | ------------- | ---------------------------------------- |
| Subject               | isced, iscedf | ISCED 2011 (level), ISCED-F 2013 (field) |
| DocType (contentType) | doctype       | Schema.org / BibTeX                      |
| Cognitive             | bloom         | Bloom's taxonomy (revised)               |
| Proficiency (context) | cefr          | CEFR                                     |

**Allowed codes per scheme (canonical list in global-standards.toml)**

- **isced**: isced-0 … isced-8 (Early childhood … Doctoral).
- **iscedf**: iscedf-00 … iscedf-10 (Generic programmes … Services).
- **bloom**: bloom-1 … bloom-6 (Remember … Create).
- **cefr**: cefr-a1, cefr-a2, cefr-b1, cefr-b2, cefr-c1, cefr-c2.
- **actfl**: actfl-n, actfl-nl, actfl-nm, actfl-nh, actfl-i, actfl-il, actfl-im,
  actfl-ih, actfl-a, actfl-al, actfl-am, actfl-ah, actfl-s.
- **doctype**: book, article, news-article, video-object, web-page;
  inproceedings, techreport, manual, unpublished, misc (BibTeX).

When adding or editing items, sources, or any payload that uses concept IDs
(subject_ids, content_type_id, cognitive_level_id, context_ids, document_type,
concept_id): use only these codes. Do not invent new codes; add new values only
by updating global-standards.toml and re-running `deno task seed:ontology`.

### Modular monolith rules

- Within a domain: endpoint → service → store/schema only.
- Cross-domain: do not import another domain's store; use that domain's service
  if needed.
- app/*.config.ts and *.handler.ts only import domain endpoints and register
  routes; no business logic.
- Postgres: `shared/infra/pg.client.ts` provides `getPg()`. Domain stores and
  system/kv use it; no KV or other storage client.

### Domain dependency (acyclic; hierarchy)

Cross-domain service calls must not form a cycle. Upper domains (orchestration)
may call support domains; support domains must not call upper domains or each
other unless the matrix below allows it.

**Hierarchy**

- **Upper (orchestration)**: content (items, worksheets, prompt building). May
  call support domains via their service only.
- **Support**: actor, concept, script, source, record, kv, audit. Do not import
  content; do not depend on each other unless listed in the matrix. app only
  imports endpoints and is outside this hierarchy.

**Allowed dependency matrix**

Rows = source domain (importer). Columns = target domain (imported). Only
service (and types/schema where needed) may be imported cross-domain; store
imports are forbidden (see Modular monolith rules above).

| From \\ To | actor | concept | content | schedule | source | script | record | kv | audit |
| ---------- | ----- | ------- | ------- | -------- | ------ | ------ | ------ | -- | ----- |
| actor      | —     | no      | no      | no       | no     | no     | no     | no | no    |
| concept    | no    | —       | no      | no       | no     | no     | no     | no | no    |
| content    | yes   | yes     | —       | no       | no     | yes    | no     | no | no    |
| schedule   | no    | no      | no      | —        | yes    | no     | no     | no | no    |
| source     | no    | yes     | no      | no       | —      | no     | yes    | no | no    |
| script     | no    | no      | no      | no       | no     | —      | no     | no | no    |
| record     | no    | no      | no      | no       | no     | no     | —      | no | no    |
| kv         | no    | no      | no      | no       | no     | no     | no     | —  | no    |
| audit      | no    | no      | no      | no       | no     | no     | yes    | no | —     |

When adding a new cross-domain service dependency: (1) ensure it does not
introduce a cycle; (2) add the edge to this matrix and to the allowlist in
`shared/prompt/scripts/check-domain-deps.ts`; (3) then implement.

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

### §P pattern guide (function body 2–4 statements)

Store.md §P limits block bodies to 2–4 AST statements; a single statement is
allowed when it is try/catch, switch, or block-bodied if (complex-statement
exemption). Prefer small functions and delegation so each body stays within the
limit.

**Avoid** (procedural, too many statements in one body):

```ts
function validateSqlFiles(files: string[]) {
  const invalidFiles = [];
  for (const file of files) {
    if (!file.endsWith(".sql")) continue;
    if (!checkNamingRule(file)) invalidFiles.push(file);
  }
  if (invalidFiles.length > 0) throw new Error("Invalid");
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

**Use complex-statement exemption** when a single guard is enough (e.g. throw if
invalid):

```ts
function ensureValidName(filename: string): void {
  if (!REGEX_SQL_NAME.test(filename)) {
    throw new Error(`Invalid SQL file name: ${filename}`);
  }
}
```
