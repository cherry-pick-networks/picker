# Boundary (Infrastructure and API scope)

Single reference for infrastructure and API scope rules. See store.md §K for
todo boundary; this file defines domain-scope constraints.

---

## Ontology (Scope 1)

- **Seeds**: `shared/infra/seed/ontology/seed.sql` (reserved),
  `shared/infra/seed/ontology/global-standards.toml` (isced, iscedf, bloom,
  cefr, doctype).
- **Validation**: Facet IDs (subjectIds, contextIds, etc.) must strictly belong
  to their designated concept_scheme. Bulk ID checks capped at 500.
- **Graph constraints**: DAG checks strictly enforced for `requires`
  relation_type only.

## Lexis seed (Scope 2)

- **Serialization rationale only in repo**:
  `shared/infra/seed/lexis/lexis-sources.toml` lists source_id and env_var; no
  copyright-sensitive content (titles, entry counts) in repo.
- **Sensitive data in .env**: Set `LEXIS_SOURCE_META_<SOURCE_ID>` to JSON
  `{ "type", "metadata" }`; seed runner reads at runtime
  (`deno task seed:lexis`).
