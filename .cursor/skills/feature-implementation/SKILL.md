---
name: feature-implementation
description: |
  Apply when adding new code or implementing a feature. References store.md
  §Q (phase-gated), §P (format), §B (commit boundary), §S (comment), §T
  (naming), §N (type-check).
---

# Feature implementation

Apply store.md **§Q, §P, §B, §S, §T, §N**. Full text in shared/prompt/store.md
Part B only; this skill gives a short checklist.

## §Q — Phase-gated cycle

1. **Phase 1**: Output only a short requirement/constraint summary. Stop; ask
   "Do you approve this requirement summary?" Do not proceed until approval.
2. **Phase 2**: After approval, propose only interfaces/types for the tree.
   Stop; ask "Do you approve this design?" Do not implement until approval.
3. **Phase 3**: Implement per approved design.
4. **Phase 4**: Add or update tests, then commit per §B.

## §P — Format

- Function body: 2–4 statements (block body); run `deno fmt`, then
  `deno task format-check`.
- File: ≤100 effective lines; split when longer.
- Line length: ≤80 characters.

## §B — Commit boundary

- One logical unit per commit; commit before starting the next unit.

## §S, §T, §N

- Comments: only those that help AI; no JSDoc that repeats the code.
- Naming: PascalCase types/interfaces, camelCase functions/vars; see §T.
- No type-check bypass: no @ts-ignore, no --no-check (§N).

## Checklist

- [ ] Requirement summary approved before design.
- [ ] Design (interfaces/types) approved before implementation.
- [ ] Each function body 2–4 statements; file ≤100 effective lines.
- [ ] `deno fmt` and `deno task format-check` run.
- [ ] Commit at feature-flag/logical boundary per §B.
