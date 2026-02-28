---
title: system domain integration and actor model
description: Final work spec — 6 domains + App, actor (display_name, level, progress), Mirror for backup/sync.
---

# system/ domain integration and actor model — final spec

See shared/prompt/to-do.md and reference.md for current API and infix list. This file is the
authoritative work instruction for the consolidation.

## Domains (6 + App)

| Domain     | Role                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Identity   | actor_id, display_name, level, progress; list/search by name          |
| Governance | scripts, mutate, allowlist/ontology (data only)                       |
| Source     | sources CRUD, /sources/:id/extract                                    |
| Mirror     | Client-owned data backup/sync: content, lexis, schedule (minimal API) |
| Storage    | Generic kv (path /storage or /kv)                                     |
| Audit      | Event/audit log                                                       |
| App        | Routing, auth, domain endpoint registration                           |

## Actor model

- **Server stores**: actor_id (PK), display_name, level, progress (and updated_at).
- **API**: GET/POST /identity/actors, GET/PATCH /identity/actors/:id. List supports query
  name/display_name.
- **Request target**: Use actor_id (preferred) or resolve name via list/search.

## Allowlist and coupling

- **Allowlist**: Types in shared contract; Governance loads and provides **data** only.
- **Source/Mirror**: Use allowlist **data** only; do not import Governance module.

## API path summary

- Identity: /identity/actors, /identity/actors/:id
- Governance: /scripts, /scripts/:path*, /script/mutate
- Source: /sources, /sources/:id, /sources/:id/extract
- Mirror: /mirror/content/items, /mirror/content/worksheets; /mirror/lexis/entries;
  /mirror/schedule/*
- Storage: /kv (or /storage)
- No build-prompt; Content under Mirror is atomic only.

## Implementation order

1. Docs (to-do, reference, copilot-minimal-plan, openapi)
2. Shared contract (allowlist types)
3. Governance (concept → allowlist, script → Governance)
4. Identity (actor + record, display_name, actors API)
5. Mirror (content, lexis, schedule)
6. Content shrink (remove build-prompt)
7. Storage / Audit
8. App routes
9. Verify (todo-check, deps, openapi ↔ routes)
