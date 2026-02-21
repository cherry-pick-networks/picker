# Backlog

## Config / scope alignment

- **ConfigSchema** has `redis_url` and `neo4j_uri`; both are out of scope and not wired in bootstrap. When extending scope, add wiring for them; if keeping current scope, consider removing or documenting as reserved.

---

## Plans – remaining (Phase 4+)

Deferred items for grade/week lesson plans (knowledge).

1. **Exam-period handling** (optional): Use `docs/plans-exam-schedule.md` to mark exam-prep weeks in API (e.g. special slot or metadata) or leave as calendar-only reference.
2. **Phase 5 (later)**: Ontology link; fill `concept_ids` on slots; optional concept summary in plan API.

---

## Worksheet generation – LLM and API (post prompt-assembly)

Deferred after in-scope work: request/response contract, student context, prompt template + assembly, format injection.

1. **Step 5 – LLM integration**: Call LLM with assembled prompt; parse response (markdown or JSON); validate; store as items or generated worksheet document. Add to scope when implementing.
2. **Step 6 – API flow**: Wire full generate flow (optional async job id, poll for result); frontend “Generate for this student” using prompt assembly + LLM when in scope.
