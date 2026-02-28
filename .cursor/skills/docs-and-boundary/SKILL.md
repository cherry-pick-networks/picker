---
name: docs-and-boundary
description: |
  Apply when editing docs (.md/.mdc), directory structure, or system/todo
  boundaries. References store.md §R, §D, §E, §F, §K, §L, §M.
---

# Docs and boundary

Apply store.md **§R, §D, §E, §F, §K, §L, §M**. Full text in shared/prompt/store.md Part B only; this
skill gives a short checklist.

**Before editing**: Run `deno task rules:summary -- docs` (or use /rules-summary docs) and apply the
listed § for this session. Keep the output in context.

## §R — AI document writing

- AI-facing docs under shared/prompt/ (except store.md and documentation/): English, positive
  phrasing, one idea per block; reference store §, do not duplicate rule text.

## §D, §E — Document and directory naming

- Rule/docs: [prefix]-[suffix].mdc or [prefix]-[infix]-[suffix].mdc; segment form per §E. Under
  shared/prompt/: [suffix].md only.
- Directory: max 3 tiers; prefix → infix → suffix; names from §E allowed sets.

## §F — Directory structure and exceptions

- Allowed forms: prefix/, prefix/infix/, prefix/infix/suffix/. Exceptions list per project.
  Documentation allowed names: reference, usage, strategy, guide, runbook.

## §K, §L, §M — Todo and system boundary

- Todo: shared/prompt/to-do.md is source of truth; do not add modules/routes without updating it
  (§K, §L). Root README: Documentation section lists only domain entry points (§M).

## Checklist

- [ ] Doc names and paths follow §D, §E, §F.
- [ ] No new modules/routes without to-do.md update.
- [ ] Root README does not deep-link to individual docs.
