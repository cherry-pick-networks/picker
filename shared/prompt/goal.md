---
title: goal
description: Final implementation goal for PICKER; todo, phase, and alignment.
---

# Final implementation goal (for AI)

Single source for PICKER end-state. Use this document to decide todo, phase, and
whether a change aligns with the target. Details live in the spec (Law) and
linked specs.

---

## 1. One-line goal

PICKER's final implementation goal is to implement the **self-evolving AI
education architect** as a single, fully working system within the todo and
governance defined in the spec: AST-based self-edit of shared/runtime/store/,
Thompson Sampling MAB for logic selection, and Governance verification before
any change is applied.

---

## 2. Target phases

Phases (MVP through full spec) and current target are defined in the spec §49.
Implement only up to the chosen phase; update the spec before implementing
beyond it.

---

## 3. Todo source

- **Modules, API, infrastructure**: This repo's `shared/prompt/todo.md`.
- **Product todo, governance**: the spec.
- Add only modules, routes, or infrastructure listed in todo.md or specified in
  the spec for the current phase.

---

## 4. In-todo

In-todo modules, agents, data layout, mutation rules, selection, and output
format are defined in todo.md and the spec. Add only items inside that todo.

---

## 5. Must

- Follow todo.md and the spec for the current phase.
- Run all autonomous mutations and applies through Governance verification.
- Add only modules, routes, and infrastructure listed in todo (todo.md or spec).
- Mutate only within shared/runtime/store/; use Governance-verified flow.
- Write to config/ or credentials only via approved mechanisms; file-based
  shared/record/ (identity-index only) only via system/record/data.store.ts (see
  todo.md).
- Apply type-check policy (store.md §N).

Concretes: spec §44–§48 and store.md.

---

## 6. References

- **The spec**: Overview, governance, agents, data layout, protocol,
  implementation and safety.
- **This repo**: shared/prompt/todo.md, shared/prompt/store.md.
- **Other specs**: web_spec, llm_models_spec (when present).
