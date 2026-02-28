---
title: policy
description: Cursor Rules (mdc) management policy.
---

# Cursor Rules (mdc) management policy

## Purpose

- `.cursor/rules/*.mdc` files configure **when** rules apply (e.g. always vs
  on-request); they do not contain rule content.
- Keep rule text in `shared/prompt/store.md` Part B only; each mdc body
  references § only.

## Current layout

See `.cursor/rules/global-agent-policy.mdc` and
`.cursor/rules/global-directory-boundary.mdc` for the current list of files and
which § each applies. Rule definitions: store.md Part B (§A���§S).

## Naming

- Name mdc files per **§D. Document and directory format** and **§E. Document
  and directory naming** (prefix[-infix]-suffix; approved axes only).
- Use §E segment names as the approved vocabulary at each tier (files,
  subfolders, modules, symbols).

## Adding or changing rules

- **Rule content**: Add or edit only in `shared/prompt/store.md` Part B.
- **Apply timing**: Add one mdc that references the relevant §; name per §D/§E.
- **Refactor existing mdc**: Follow **§J. Migration boundary** (plan first;
  create new files then remove old; one migration per commit).

## Relation to other docs

- Rule definitions: `shared/prompt/store.md` Part B.
- Documentation: allowed doc names in `documentation/` are reference, usage,
  strategy, guide, runbook (store §F). Migration history and mapping:
  `shared/prompt/documentation/strategy.md`.
