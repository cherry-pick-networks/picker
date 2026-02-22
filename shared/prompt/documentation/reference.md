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

### Target layout (flat domain: files under system/<infix>/)

```
system/
  actor/     *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts, *.dto.ts
  content/   *.endpoint.ts, *.service.ts, *.store.ts, *.schema.ts, *.types.ts
  source/    *.endpoint.ts, *.service.ts, *.store.ts
  script/    *.endpoint.ts, *.service.ts, *.store.ts, *.types.ts, *.validation.ts
  record/    *.endpoint.ts, *.store.ts
  kv/        *.endpoint.ts, *.store.ts
  audit/     *.log.ts
  app/       *.config.ts
  routes.ts  (entry; imports app/routes-register.config.ts)
```

### Migration mapping (3-layer → flat, completed)

| Old path (3-layer)              | New path (flat)                     |
| ------------------------------- | ----------------------------------- |
| system/actor/endpoint/profile.ts | system/actor/profile.endpoint.ts    |
| system/actor/service/profile.ts | system/actor/profile.service.ts     |
| system/actor/store/profile.ts   | system/actor/profile.store.ts      |
| system/content/endpoint/content.ts | system/content/content.endpoint.ts |
| system/content/service/*.ts     | system/content/*.service.ts         |
| system/content/schema/*.ts      | system/content/*.schema.ts           |
| system/source/endpoint|service|store/*.ts | system/source/*.endpoint|service|store.ts |
| system/script/endpoint|service|store|validation/*.ts | system/script/*.endpoint|service|store|validation.ts |
| system/record/endpoint|store/data.ts | system/record/data.endpoint.ts, data.store.ts |
| system/kv/endpoint|store/kv.ts | system/kv/kv.endpoint.ts, kv.store.ts |
| system/audit/log/log.ts        | system/audit/audit.log.ts           |
| system/app/config/*.ts         | system/app/*.config.ts              |

### Modular monolith rules

- Within a domain: endpoint → service → store/schema only.
- Cross-domain: do not import another domain's store; use that domain's service
  if needed.
- app/*.config.ts only imports domain endpoints and registers routes; no
  business logic.
