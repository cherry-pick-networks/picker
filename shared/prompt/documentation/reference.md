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

| Infix   | Responsibility                                                         |
| ------- | ---------------------------------------------------------------------- |
| actor   | Profile, progress (identity and state)                                 |
| app     | Route registration and app wiring                                      |
| audit   | Change/run log artifacts                                               |
| concept | Concept scheme, concept, concept_relation (ontology)                   |
| content | Items, worksheets, prompt building                                     |
| kv      | Generic key-value HTTP API; Postgres-backed, client from shared/infra. |
| record  | Record store (extracted/identity data)                                 |
| script  | Scripts store, AST apply, Governance                                   |
| source  | Source collection and read                                             |

### Allowed suffix (artifacts)

| Suffix     | Meaning                               | §E axis  |
| ---------- | ------------------------------------- | -------- |
| endpoint   | HTTP entry (Hono routes)              | Artifact |
| service    | Application service (use cases)       | —        |
| store      | Persistence (KV, file)                | Artifact |
| schema     | Zod schemas and domain types          | Artifact |
| types      | Type-only definitions                 | Meta     |
| transfer   | Request/response or DTO types         | Artifact |
| client     | Client wrapper (e.g. KV, API)         | Artifact |
| validation | Policy/verification (e.g. Governance) | Policy   |
| log        | Log artifact storage                  | Meta     |
| config     | Wiring (e.g. route registration)      | Artifact |

### Target layout (flat domain: files under system/<infix>/)

```
system/
  actor/     *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts, *.transfer.ts
  app/       *.config.ts
  audit/     *.log.ts
  concept/   *.service.ts, *.store.ts
  content/   *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts
  kv/        *.endpoint.ts, *.store.ts
  record/    *.endpoint.ts, *.store.ts
  script/    *.endpoint.ts, *.service.ts, *.store.ts, *.types.ts, *.validation.ts
  source/    *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, source-extract.service.ts, source-llm.client.ts
  routes.ts  (entry; imports app/routes-register.config.ts)
```

### Test file names (tests/)

Under `tests/`, every `.ts` file must be `[name]_test.ts` (Deno convention). The
**name** part must use lowercase and hyphens only (§E), e.g.
`scripts-store_test.ts`. Non-test helpers (e.g. `with_temp_scripts_store.ts`)
are listed in PATH_EXCEPTIONS. Validated by `deno task ts-filename-check`.

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
checks that every `shared/infra/schema/*.sql` file matches `NN_<name>.sql` with
name satisfying `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`. Run:
`deno task sql-filename-check` (pre-commit or CI; see store.md §5).

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
| `shared/infra/seed/ontology/seed.sql`              | Ontology seed (DDC scheme).          |
| `shared/infra/seed/csat-ontology.toml`              | Ontology seed (csat-type, cog, ctx). |
| `shared/infra/seed/ontology/csat-subjects.toml`    | Ontology seed: csat-subjects (all exam areas). |

### Ontology and facet policy

- **DAG**: The whole of `concept_relation` must form a DAG; there must be no
  cycles for any `relation_type` (e.g. broader, narrower, requires, depends-on).
  Run `deno task ontology-acyclic-check` to verify (e.g. after applying schema
  and seed).
- **Facet schemes**: Subject IDs use allowed schemes (e.g. csat-subjects, ddc).
  Content type, cognitive level, and context IDs use their respective allowed
  schemes only (see system/concept/concept.config.ts). Content and worksheet
  APIs validate concept IDs per facet and cap at 500 per request.
- **CI**: `deno task pre-push` does not run `ontology-acyclic-check`. After
  running `deno task seed:ontology`, run `deno task ontology-acyclic-check`
  manually when changing ontology seed or relations.

### Modular monolith rules

- Within a domain: endpoint → service → store/schema only.
- Cross-domain: do not import another domain's store; use that domain's service
  if needed.
- app/*.config.ts only imports domain endpoints and registers routes; no
  business logic.
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

| From \\ To | actor | concept | content | source | script | record | kv | audit |
| ---------- | ----- | ------- | ------- | ------ | ------ | ------ | -- | ----- |
| actor      | —     | no      | no      | no     | no     | no     | no | no    |
| concept    | no    | —       | no      | no     | no     | no     | no | no    |
| content    | yes   | yes     | —       | no     | yes    | no     | no | no    |
| source     | no    | no      | no      | —      | no     | no     | no | no    |
| script     | no    | no      | no      | no     | —      | no     | no | no    |
| record     | no    | no      | no      | no     | no     | —      | no | no    |
| kv         | no    | no      | no      | no     | no     | no     | —  | no    |
| audit      | no    | no      | no      | no     | no     | yes    | no | —     |

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
