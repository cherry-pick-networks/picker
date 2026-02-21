# Final implementation goal (for AI)

Single source for PICKER end-state. Use this document to decide scope, phase,
and whether a change aligns with the target. Details live in 1_SPEC (Law) and
linked specs.

---

## 1. One-line goal

PICKER's final implementation goal is to implement the **self-evolving AI
education architect** as a single, fully working system within the scope and
governance defined in the spec (1_SPEC §1, §8.1, §49): AST-based self-edit of
ops/scripts/, Thompson Sampling MAB for logic selection, and Governance
verification before any change is applied.

---

## 2. Target phases

- **MVP (minimal working PICKER)**: Phase 3. Genome, agents, protocol, AST
  self-edit, MAB-based logic selection.
- **Full spec completion**: Phase 10. Includes BKT/IRT/MDP, governance engine,
  2026 infra, economy, human–AI alignment and kill switch.
- **Current target**: Set per project; do not implement beyond the chosen phase
  until the roadmap (1_SPEC §49) is updated.

---

## 3. Scope source

- **Modules, API, infrastructure**: This repo's `shared/prompt/boundary.md`.
- **Product scope, governance, roadmap**: 1_SPEC §1 (overview), §8.1
  (governance), §49 (10-Phase roadmap).
- Do not add modules, routes, or infrastructure not listed in boundary.md or
  specified in 1_SPEC for the current phase.

---

## 4. In-scope (keywords)

- **Control**: Hub (FastAPI, Redis Pub/Sub, optional WebSocket); single control
  plane.
- **Agents**: Manager (learner), Architect (curriculum), Designer (content),
  Scout (external data), Governance (constitution and verification). Five
  agents; contracts and data paths per 1_SPEC §23, §34, §38.
- **Data layout**: data/ lifecycle 0_raw → 1_interim → 2_master → 3_output,
  9_system; UUID v7 for 2_master and 3_output; mappings in 9_system/mappings.json
  (1_SPEC §31, §26.4).
- **Mutation**: AST-based self-edit of ops/scripts/ only; same process; no
  direct writes to data/config/ or credentials (1_SPEC §48).
- **Selection**: Thompson Sampling MAB for high-performance logic; Governance
  verification required before apply/merge (1_SPEC §8.1, §44–§48).
- **Output format**: Unit/content metadata `format?: "quarto"|"latex"|"markdown"`
  (default Quarto); no per-department hardcoding (1_SPEC §2.1).
- **Web / LLM**: Per web_spec and llm_models_spec; feature–model mapping and
  env/credentials as specified there.

---

## 5. Must / Must not

- Do implement only what is in boundary.md and 1_SPEC for the current phase.
- Do run all autonomous mutations and applies through Governance verification.
- Do follow 1_SPEC §44 (errors/recovery), §45 (security), §46 (testing), §48
  (AST isolation, circuit breaker, immutable audit, admission controller).
- Do not add modules, API routes, or infrastructure not in scope.
- Do not apply or merge without ValidationResult / Governance verification.
- Do not mutate outside ops/scripts/ or write directly to data/config/ or
  credentials.
- Do not bypass type-check policy (store.md §N).

---

## 6. References

- **1_SPEC**: §1 (overview), §2.1 (output format), §4.4 / §23 / §34 (agents),
  §8.1 (governance), §13 / §25 (task flow), §26.4 (entities), §31 (data
  layout), §35 (context keys), §36 (protocol), §38 (agent I/O), §41–§48
  (implementation and safety), §49 (10-Phase roadmap), §43 / §43.3 (DB/schema
  when extended).
- **This repo**: shared/prompt/boundary.md, shared/prompt/store.md.
- **Other specs**: web_spec, llm_models_spec (when present).
