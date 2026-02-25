# system

Application layer: modular monolith with domain-bounded endpoints, services, and
stores. Entry for HTTP is `routes.ts`; domain modules use flat
`[name].[suffix].ts` layout under `system/<infix>/`.

## Entry points

| Path                   | Role                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| [routes.ts](routes.ts) | Route list and registration; imports app config.                      |
| [app/](app/)           | Route registration only. Each `*.config.ts` imports domain endpoints. |
| [actor/](actor/)       | Profile, progress: endpoint, service, store, schema.                  |
| [content/](content/)   | Items, worksheets, prompt: endpoint, service, store, schema.          |
| [source/](source/)     | Source collection: endpoint, service, store.                          |
| [script/](script/)     | Scripts store, AST, Governance: endpoint, service, store, validation. |
| [record/](record/)     | Record store (extracted/identity): endpoint, store.                   |
| [kv/](kv/)             | Generic key-value API (Postgres-backed): endpoint, store.              |
| [audit/](audit/)       | Log artifacts (e.g. e2e-runs).                                        |

## Cross-domain rules

- Cross-domain: use the other domain’s **service** (or types/schema), not its
  store.
- Dependencies must stay **acyclic** and match the allowed matrix in reference.
- Storage: use `getPg()` from `shared/infra`; no KV.

## Quick links

- **Structure and suffix**:
  [shared/prompt/documentation/reference.md](../shared/prompt/documentation/reference.md)
  (infix/suffix, layout, dependency matrix).
- **Scope (modules and API)**:
  [shared/prompt/boundary.md](../shared/prompt/boundary.md).
