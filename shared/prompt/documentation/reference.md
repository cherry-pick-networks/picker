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
| kv      | Generic key-value HTTP API; Postgres-backed, client from shared/infra. |
| audit   | Change/run log artifacts                                 |
| app     | Route registration and app wiring                        |

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
  content/   *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts
  source/    *.endpoint.ts, *.service.ts, *.store.ts
  script/    *.endpoint.ts, *.service.ts, *.store.ts, *.types.ts, *.validation.ts
  record/    *.endpoint.ts, *.store.ts
  kv/        *.endpoint.ts, *.store.ts
  audit/     *.log.ts
  app/       *.config.ts
  routes.ts  (entry; imports app/routes-register.config.ts)
```

### Test file names (tests/)

Under `tests/`, every `.ts` file must be `[name]_test.ts` (Deno convention). The
**name** part must use lowercase and hyphens only (§E), e.g.
`scripts-store_test.ts`. Non-test helpers (e.g. `with_temp_scripts_store.ts`)
are listed in PATH_EXCEPTIONS. Validated by `deno task ts-filename-check`.

### Schema (DDL) file naming

DDL files under `shared/infra/schema/` use a fixed pattern so execution order
is clear and names align with store.md §E (lowercase, hyphens, no underscores).

- **Pattern**: `NN_<name>.sql`
  - **NN**: Two-digit number (00–99) for execution order. Preserved when adding
    migrations for the same domain (e.g. `02_source.sql`,
    `02_source-add-column.sql`).
  - **&lt;name&gt;**: Lowercase letters, digits, and hyphens only. Same rule as
    the TS filename *name* part: `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`. No underscores.
- **Examples**: `01_actor.sql`, `02_source.sql`, `03_kv.sql`, `04_content.sql`.
- **Vocabulary**: Prefer names that match project axes (e.g. actor, content,
  source, kv). New domains: align with boundary.md and this reference (allowed
  infix/suffix).
- **Migration**: When renaming or adding DDL files, follow the migration
  boundary (store.md §J): plan first, then apply renames and reference
  updates in one logical change.

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
- **Support**: actor, script, source, record, kv, audit. Do not import content;
  do not depend on each other unless listed in the matrix. app only imports
  endpoints and is outside this hierarchy.

**Allowed dependency matrix**

Rows = source domain (importer). Columns = target domain (imported). Only
service (and types/schema where needed) may be imported cross-domain; store
imports are forbidden (see Modular monolith rules above).

| From \\ To | actor | content | source | script | record | kv | audit |
| ---------- | ----- | ------- | ------ | ------ | ------ | -- | ----- |
| actor      | —     | no      | no     | no     | no     | no | no    |
| content    | yes   | —       | no     | yes    | no     | no | no    |
| source     | no    | no      | —      | no     | no     | no | no    |
| script     | no    | no      | no     | —      | no     | no | no    |
| record     | no    | no      | no     | no     | —      | no | no    |
| kv         | no    | no      | no     | no     | no     | —  | no    |
| audit      | no    | no      | no     | no     | yes    | no | —     |

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
