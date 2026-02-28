---
name: commit-boundary
description: |
  Apply for commit message and session/commit boundary only. References
  store.md §A (commit message), §B (when to commit, session boundary).
---

# Commit and session boundary

Apply store.md **§A, §B**. Full text in shared/prompt/store.md Part B only.

**Before using**: Run `deno task rules:summary -- commit` to confirm §A, §B for this session.

**When to use this skill** — Use when the user asks to commit (e.g. “commit current changes”), when
a logical unit is done, or when the task type is `commit` (e.g. after
`deno task rules:summary -- commit`).

## Procedure

1. Run `git status`; then `git add` (appropriate paths), then `git commit` with a message per §A.
2. Do not start the next logical unit without committing the current one; no batch commit at the
   end.

## §A — Commit message format

- `<type>[(todo)]: <description>`; imperative, lowercase.
- Types: feat, fix, docs, chore, refactor, perf, test, ci, build.
- Optional todo: e.g. module or feature-flag name.

## §B — When to commit and session end

- Commit at each feature-flag or logical unit boundary; do not batch at end of task.
- Before starting the next unit: git add and git commit current changes.
- Session/handoff: for long sessions or handoff, follow §B (handoff doc, next steps).

## Checklist

- [ ] Commit message matches §A.
- [ ] One logical unit per commit; committed before next unit.
- [ ] For handoff/long session: handoff doc updated, next steps listed.
