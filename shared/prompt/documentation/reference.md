# Reference

Project reference for structure, naming, and migration.

---

## System structure (system/ infix/suffix)

Under `system/` only the form `system/<infix>/<suffix>` is allowed (plus
optional `system/<infix>/` with no suffix). Infix = domain (bounded context);
suffix = artifact type. Aligns with store.md §E/§F and modular monolith.

### Allowed infix (domains)

| Infix   | Responsibility                         |
| ------- | -------------------------------------- |
| actor   | Profile, progress (identity and state) |
| content | Items, worksheets, prompt building     |
| source  | Source collection and read             |
| script  | Scripts store, AST apply, Governance   |
| record  | Record store (extracted/identity data) |
| kv      | Generic Deno KV access                 |
| audit   | Change/run log artifacts               |
| app     | Route registration and app wiring      |

### Allowed suffix (artifacts)

| Suffix     | Meaning                               | §E axis  |
| ---------- | ------------------------------------- | -------- |
| endpoint   | HTTP entry (Hono routes)              | Artifact |
| service    | Application service (use cases)       | —        |
| store      | Persistence (KV, file)                | Artifact |
| schema     | Zod schemas and domain types          | Artifact |
| types      | Type-only definitions                 | Meta     |
| validation | Policy/verification (e.g. Governance) | Policy   |
| log        | Log artifact storage                  | Meta     |
| config     | Wiring (e.g. route registration)      | Artifact |

### Target layout

```
system/
  actor/     endpoint, service, store, schema
  content/   endpoint, service, store, schema
  source/    endpoint, service, store
  script/    endpoint, service, store, validation
  record/    endpoint, store
  kv/        endpoint, store
  audit/     log
  app/       config
```

### Migration mapping (old → new)

| Old path                                                  | New path                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| system/router/home.ts                                     | system/app/config (or keep at app level)                            |
| system/router/profile*.ts                                 | system/actor/endpoint/                                              |
| system/router/content.ts                                  | system/content/endpoint/                                            |
| system/router/source.ts                                   | system/source/endpoint/                                             |
| system/router/scripts.ts, ast*.ts                         | system/script/endpoint/                                             |
| system/router/data.ts                                     | system/record/endpoint/                                             |
| system/router/kv.ts                                       | system/kv/endpoint/                                                 |
| system/service/profile.ts, progress.ts, profile-schema.ts | system/actor/service/                                               |
| system/service/content*.ts, content-schema.ts             | system/content/service/                                             |
| system/service/source.ts                                  | system/source/service/                                              |
| system/service/ast.ts                                     | system/script/service/                                              |
| system/store/profile.ts                                   | system/actor/store/                                                 |
| system/store/content.ts                                   | system/content/store/                                               |
| system/store/source.ts                                    | system/source/store/                                                |
| system/store/scripts*.ts                                  | system/script/store/                                                |
| system/store/data.ts                                      | system/record/store/                                                |
| system/store/kv.ts                                        | system/kv/store/                                                    |
| system/store/log.ts                                       | system/audit/log/ (or audit/store)                                  |
| system/validator/                                         | system/script/validation/                                           |
| system/routes*.ts                                         | system/app/config/ (or system/routes.ts re-exports from app/config) |

### Modular monolith rules

- Within a domain: endpoint → service → store/schema only.
- Cross-domain: do not import another domain's store; use that domain's service
  if needed.
- app/config only imports domain endpoints and registers routes; no business
  logic.
