# Final implementation goal (for AI)

Single source for PICKER end-state. Use this document to decide scope, phase,
and whether a change aligns with the target. Details live in the spec (Law) and
linked specs.

---

## 1. One-line goal

PICKER's final implementation goal is to implement the **self-evolving AI
education architect** as a single, fully working system within the scope and
governance defined in the spec: AST-based self-edit of shared/runtime/store/, Thompson
Sampling MAB for logic selection, and Governance verification before any change
is applied.

---

## 2. Target phases

Phases (MVP through full spec) and current target are defined in the spec §49.
Do not implement beyond the chosen phase until the spec is updated.

---

## 3. Scope source

- **Modules, API, infrastructure**: This repo's `shared/prompt/boundary.md`.
- **Product scope, governance**: the spec.
- Do not add modules, routes, or infrastructure not listed in boundary.md or
  specified in the spec for the current phase.

---

## 4. In-scope

In-scope modules, agents, data layout, mutation rules, selection, and output
format are defined in boundary.md and the spec. Do not add items outside that
scope.

---

## 5. Must / Must not

- Do follow boundary.md and the spec for the current phase.
- Do run all autonomous mutations and applies through Governance verification.
- Do not add modules, routes, or infrastructure outside scope.
- Do not mutate outside shared/runtime/store/ or write directly to
  data/config/ or credentials.
- Do not bypass type-check policy (store.md §N).

Concretes are in the spec §44–§48 and store.md.

---

## 6. References

- **The spec**: Overview, governance, agents, data layout, protocol,
  implementation and safety.
- **This repo**: shared/prompt/boundary.md, shared/prompt/store.md.
- **Other specs**: web_spec, llm_models_spec (when present).
