---
name: refactor-and-commit
description: |
  Apply when refactoring code or preparing commits. References RULESET.md §P,
  §B, §S, §T, §N, §A (commit message and boundary).
---

# Refactor and commit

Apply RULESET.md **§P, §B, §S, §T, §N, §A**. Full text in
shared/context/RULESET.md Part B only; this skill gives a
short checklist.

**Before editing**: Run
`deno task rules:summary -- refactor` (or use /rules-summary
refactor) and apply the listed § for this session. Keep the
output in context.

## §P — Format

- Function body: 2–4 statements; file ≤100 effective lines;
  line length ≤80.
- Run `deno fmt`, then `deno task format-check` after edits.

## §B — Commit boundary

- One logical unit per commit; commit before the next unit.

## §A — Commit message

- Pattern: `<type>[(todo)]: <description>`; imperative,
  lowercase.
- Types: feat, fix, docs, chore, refactor, perf, test, ci,
  build.

## §S, §T, §N

- Comments: only those that help AI (§S). Naming per §T. No
  type-check bypass (§N).

## Checklist

- [ ] Refactor preserves 2–4 statements per body and file
      length.
- [ ] `deno fmt` and `deno task format-check` run.
- [ ] Commit message follows §A; one logical unit per commit
      (§B).
