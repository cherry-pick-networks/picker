---
name: migration-and-naming
description: |
  Apply when migrating rules/directories or changing naming. References
  store.md §J, §D, §E, §F.
---

# Migration and naming

Apply store.md **§J, §D, §E, §F**. Full text in shared/prompt/store.md Part B
only.

**Before editing**: Run `deno task rules:summary -- migration` (or use
/rules-summary migration) and apply the listed § for this session. Keep the
output in context.

## §J — Migration boundary

- Plan before execute: write a migration plan (current file → target filename
  and content responsibility); do not rename or split without this mapping.
- Execute order: create all new rule/files first, then delete old ones; one
  logical migration per commit.
- New names follow §D and §E. Adding/refactoring .cursor/rules does not require
  todo.md change.

## §D, §E, §F

- Document and directory format/naming: segment form, axis rule, allowed sets
  per §E. Directory structure: max 3 tiers, allowed forms only; exceptions list
  maintained.

## Checklist

- [ ] Migration plan written (current → target) before any renames.
- [ ] New files created first, then old files removed.
- [ ] New names follow §D, §E; directory structure follows §F.
