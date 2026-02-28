---
title: reference
description: Project reference for structure, naming, and migration.
---

# Reference

Project reference for structure, naming, and migration.

---

## System structure (system/ infix/suffix)

Under `system/` the form is `system/<infix>/` (one folder per domain). **TS
filename** = default export name: camelCase for functions/modules (e.g.
`profileEndpoint.ts`, `profileService.ts`), PascalCase for class/singleton; no
dot or hyphen in the filename. Infix = domain (bounded context). Aligns with
store.md §E/§F and Airbnb-style naming (filename matches export).

### Allowed infix (domains)

Six domains + App. Spec:
`shared/prompt/documentation/system-domain-identity-mirror-spec.md`.

| Infix        | Responsibility                                                        |
| ------------ | --------------------------------------------------------------------- |
| app          | Route registration and auth                                           |
| audit        | Event/audit log artifacts                                             |
| governance   | Scripts store, mutate, allowlist/ontology (data only)                 |
| identity     | Actors: actor_id, display_name, level, progress; list/search by name  |
| mirror       | Client-owned data backup/sync: content, lexis, schedule (minimal API) |
| source       | Source CRUD and extract                                               |
| storage      | Generic key-value (kv); Postgres-backed                               |
| batch        | Batch jobs and bulk operations                                        |
| export       | Export and external output                                            |
| notification | Notifications and alerts                                              |
| report       | Reports and aggregations                                              |
| sync         | Synchronization and replication                                       |
| workflow     | Workflow and process orchestration                                    |

### Artifact roles (no dot in filename)

Role is implied by export; filename = default export name. Common patterns:
endpoint (HTTP routes), service (use cases), store (persistence), schema (Zod),
client (API wrapper), config (wiring). Use camelCase (e.g. `profileEndpoint.ts`,
`sourceExtractService.ts`). See store.md §E.

### Target layout (flat domain: files under system/<infix>/)

```
system/
  app/         routesRegisterConfig.ts, homeHandler.ts, authMiddleware.ts, addUtil.ts
  audit/       auditE2eRuns.ts
  governance/  scriptsEndpoint, mutateEndpoint, conceptSchemes; governanceValidation.ts
  identity/    actorsEndpoint.ts, actorsService.ts, actorsSchema.ts
  mirror/      content, lexis, schedule backup/sync endpoints and services
  source/      sourceEndpoint.ts, sourceService.ts, sourceStore.ts, sourceSchema.ts, sourceExtractService.ts
  storage/     kvEndpoint.ts, kvStore.ts
  routes.ts    (entry; imports app config)
```

### Test file names (tests/)

Under `tests/`, every `.ts` file must be `[name]_test.ts` (Deno convention). The
**name** part uses camelCase (e.g. `scriptsStore_test.ts`,
`sourceExtractEndpoint_test.ts`). Non-test helpers (e.g. `with_temp_scripts_store.ts`)
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
  source, kv). New domains: align with to-do.md and this reference (allowed
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
§E-compliant name; adjust numbering if needed (see to-do.md and §J).

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
`loadSql(baseUrl, filename)` from `shared/infra/sqlLoader.ts`; baseUrl
typically `new URL("./sql/", import.meta.url)`. Parameters: PostgreSQL
`$1, $2, ...`; document order/meaning in the .sql file or store. DDL:
`shared/infra/schema/*.sql`. Seed: `shared/infra/seed/...`.

### Migration mapping (3-layer → flat, completed)

| Old path (3-layer)                 | New path (flat)                    |
| ---------------------------------- | ---------------------------------- |
| system/actor/endpoint/profile.ts   | system/actor/profileEndpoint.ts   |
| system/actor/service/profile.ts    | system/actor/profileService.ts    |
| system/actor/store/profile.ts      | system/actor/profileStore.ts      |
| system/content/endpoint/content.ts | system/content/contentEndpoint.ts |
| system/content/service/*.ts        | system/content/*.service.ts        |
| system/content/schema/*.ts         | system/content/*.schema.ts         |
| system/source/endpoint             | service                            |
| system/script/endpoint             | service                            |
| system/record/endpoint             | identityIndexStore.ts            |
| system/kv/endpoint                 | store/kv.ts                        |
| system/audit/log/log.ts            | system/audit/auditE2eRuns.ts     |
| system/app/config/*.ts             | system/app/*.config.ts             |

### Data file locations (TOML)

| Path                                               | Purpose                                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/record/reference/identity-index.toml`      | Identity index. API: full data when Entra Bearer token present.                                                                       |
| `system/audit/e2e-runs.toml`                       | E2E run log (schemaVersion + runs[])                                                                                                  |
| `shared/infra/seed/ontology/seed.sql`              | Ontology seed (reserved).                                                                                                             |
| `shared/infra/seed/ontology/global-standards.toml` | **Single definition** for concept schemes and concepts (isced, iscedf, bloom, cefr, actfl, doctype). Seed: `deno task seed:ontology`. |
| `shared/prompt/documentation/grammar-topics.md`    | Grammar curriculum: 17 major topics, level→unit mapping (schedule/content).                                                           |
| `shared/infra/seed/grammar-unit-topics.toml`       | unit_id → topic_label for grammar item generation (POST /content/items/generate). Synced with grammar-topics.md.                      |
| `shared/infra/seed/curriculum-52weeks.json`        | Seed source for 52-week curriculum; runtime data in DB table `curriculum_slot`.                                                       |
| `shared/infra/seed/lexis/lexis-sources.toml`       | Lexis source list (source_id, env_var). Actual metadata from .env (store.md §V); `deno task seed:lexis`.                              |

**Not ontology**: Identity index, lexis sources, curriculum slots (52-week),
grammar-unit-topics.toml, and client identity are **not** concept schemes; they
are reference or runtime data. Only `global-standards.toml` (and any future
concept_relation TOML) defines the ontology.

### Curriculum (52 weeks)

52-week grid (3 units per week per level) is stored in DB table
`curriculum_slot`, seeded from `shared/infra/seed/curriculum-52weeks.json`
(`deno task seed:curriculum`). Runtime: GET /schedule/plan/annual (query
`level`). Topic mapping: grammar-topics.md. Weekly plan logic:
schedule-fsrs-plan.md.

### Ontology and facet policy

- **Single definition**: All concept schemes and concepts are defined only in
  `shared/infra/seed/ontology/global-standards.toml`. Code and docs derive from
  it; `deno task seed:ontology` loads into DB. Code must match TOML (CI:
  `deno task ontology-schemes-check`).
- **DAG**: The whole of `concept_relation` must form a DAG; there must be no
  cycles for any `relation_type` (e.g. broader, narrower, requires, depends-on).
  Run `deno task ontology-acyclic-check` to verify (e.g. after applying schema
  and seed).
- **Facet schemes**: Subject IDs use isced, iscedf. Content type, cognitive
  level, and context use their respective allowed schemes (see
  system/concept/conceptSchemes.ts). Content and worksheet APIs validate
  concept IDs per facet and cap at 500 per request.
- **CI**: `deno task pre-push` runs `ontology-schemes-check`. It does not run
  `ontology-acyclic-check`; after changing ontology seed or relations, run
  `deno task ontology-acyclic-check` manually.

### Classification allowlists (4 facets)

**Canonical source**: `shared/infra/seed/ontology/global-standards.toml`. The
lists below are a summary; the TOML (and DB after seed) is the authority.
Runtime: `system/concept/conceptSchemes.ts` maps each facet to scheme(s);
content and (when implemented) source APIs reject values not in the allowlist.

**Facet → scheme mapping**

| Facet                 | Schemes       | Standard                                 |
| --------------------- | ------------- | ---------------------------------------- |
| Subject               | isced, iscedf | ISCED 2011 (level), ISCED-F 2013 (field) |
| DocType (contentType) | doctype       | Schema.org / BibTeX                      |
| Cognitive             | bloom         | Bloom's taxonomy (revised)               |
| Proficiency (context) | cefr, actfl   | CEFR, ACTFL                              |

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
- Postgres: `shared/infra/pgClient.ts` provides `getPg()`. Domain stores and
  system/kv use it; no KV or other storage client.

### Domain dependency (acyclic; data coupling)

Cross-domain service calls must not form a cycle. Identity, Storage, Audit do
not call other domains. Governance provides allowlist **data** only; Source and
Mirror use that data (no Governance module import).

**Hierarchy**

- **App**: Registers routes only; no business logic.
- **Identity, Storage, Audit**: No outgoing domain service calls.
- **Governance**: Provides allowlist data (e.g. GET or bootstrap). No calls to
  Identity/Source/Mirror.
- **Source, Mirror**: Use allowlist **data** only (shared contract types or
  injected data). Do not import Governance module.

**Allowed dependency matrix**

Rows = importer; columns = imported. Only data/types or explicit allowed
service; no store cross-import.

| From \\ To | identity | governance | source | mirror | storage | audit |
| ---------- | -------- | ---------- | ------ | ------ | ------- | ----- |
| identity   | —        | no         | no     | no     | no      | no    |
| governance | no       | —          | no     | no     | no      | no    |
| source     | no       | no (data)  | —      | no     | no      | no    |
| mirror     | no       | no (data)  | no     | —      | no      | no    |
| storage    | no       | no         | no     | no     | —       | no    |
| audit      | no       | no         | no     | no     | no      | —     |

When adding a cross-domain dependency: (1) ensure acyclic; (2) update this
matrix and `shared/prompt/scripts/check-domain-deps.ts`; (3) then implement.

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
  `system/actor/profileSchema.ts`).
- **Exception**: snake_case when the shape is dictated by an external API or
  persistence contract; document in the file (e.g. "API/DB contract"). Example:
  `system/content/contentSchema.ts` uses `item_id`, `created_at`,
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
