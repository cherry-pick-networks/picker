# system

Application layer: modular monolith with domain-bounded
endpoints, services, and stores. Entry for HTTP is
`routes.ts`; domain modules use flat layout under
`system/<infix>/`.

## Domains (5)

| Path                       | Role                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| [routes.ts](routes.ts)     | Route list and registration; imports app config.                                  |
| [app/](app/)               | Route registration and auth. Imports domain endpoints only.                       |
| [identity/](identity/)     | Actors: actor_id, display_name, level, progress. List/get/create/patch; schedule. |
| [content/](content/)       | Source CRUD, extract; material (lexis entries); content item CRUD.                 |
| [governance/](governance/) | Scripts store, mutate (LLM), allowlist/ontology (concept); audit log (e2e_runs).  |
| [infra/](infra/)           | Postgres, SQL loader, schema/seed; KV storage; batch (dbListAll).                 |

CLI import scripts:
[content/material/importHighBasic.ts](content/material/importHighBasic.ts),
[content/importBooksToSources.ts](content/importBooksToSources.ts).
Run via `deno task import:lexis-high-basic` (after `deno task seed:material`),
`deno task import:books`, etc.

## Cross-domain rules

- Cross-domain: use the other domain's **service** (or
  types/schema), not store.
- Dependencies must stay **acyclic**; see MANUAL.md matrix.
- Storage: use `getPg()` from `system/infra` only.

## Quick links

- **Structure and suffix**:
  [MANUAL.md](../shared/context/documentation/MANUAL.md)
- **Modules and API**:
  [BACKLOG.md](../shared/context/BACKLOG.md)
