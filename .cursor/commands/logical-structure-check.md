# Logical structure check

Run `deno task logical-structure-check`. Verifies component
boundaries per MANUAL.md § Modular monolith and Domain
dependency.

1. **Boundary**: No cross-component import of another
   component's store (e.g. `*Store`, `*.store.ts`).
2. **Public API**: Cross-component imports only to public
   entry (e.g. `*Endpoint.ts`, `*OpenApi.ts`, `*register*Routes.ts`).
3. **Dependency**: Acyclic and only allowed edges (identity,
   governance, content, report matrix).

If it fails: fix the reported file/import or dependency,
then re-run. Config: `pipeline/config/logicalStructureConfig.ts`.
