---
name: docs-and-boundary
description: |
  Apply when editing docs (.md/.mdc), directory structure, or system/todo
  boundaries. References RULESET.md §R, §D, §E, §F, §K, §L, §M.
---

# Docs and boundary

Apply RULESET.md **§R, §D, §E, §F, §K, §L, §M**. Full text
in shared/context/RULESET.md Part B only; this skill gives a
short checklist.

**Before editing**: Run `deno task rules:summary -- docs`
(or use /rules-summary docs) and apply the listed § for this
session. Keep the output in context.

## §R — AI document writing

- AI-facing docs under shared/context/ (except RULESET.md
  and documentation/): English, positive phrasing, one idea
  per block; reference store §, do not duplicate rule text.

## §D, §E — Document and directory naming

- Rule/docs: [prefix]-[suffix].mdc or
  [prefix]-[infix]-[suffix].mdc; segment form per §E. Under
  shared/context/: [suffix].md only.
- Directory: max 3 tiers; prefix → infix → suffix; names
  from §E allowed sets.

## §F — Directory structure and exceptions

- Allowed forms: prefix/, prefix/infix/,
  prefix/infix/suffix/. Exceptions list per project.
  Documentation allowed names: reference, usage, strategy,
  guide, runbook.

## §K, §L, §M — Todo and system boundary

- Todo: BACKLOG.md for modules/infra; openapi.yaml +
  system/routes.ts for API routes; do not add without
  updating the relevant source (§K, §L). Root README:
  Documentation section lists only domain entry points (§M).

## Checklist

- [ ] Doc names and paths follow §D, §E, §F.
- [ ] No new routes without openapi.yaml path and routes.ts
      entry; no new modules without BACKLOG.md update.
- [ ] Root README does not deep-link to individual docs.
