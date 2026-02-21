# Cursor Rules (mdc) management policy

## Purpose

- `.cursor/rules/*.mdc` files configure **when** rules apply (e.g. always vs
  on-request), not rule content.
- Rule text lives only in `shared/prompt/store/shared-prompt-store.md` (Part B).
  Each mdc body references § only; no duplicate rule text.

## Current layout

| File                            | When applied | Sections                                   |
| ------------------------------- | ------------ | ------------------------------------------ |
| `global-agent-policy.mdc`       | Always       | §A, §B, §C, §D, §E, §G, §H, §I, §J, §K, §L |
| `global-directory-boundary.mdc` | On request   | §F                                         |

## Naming

- All mdc file names follow **§D. Document and directory format** and **§E.
  Document and directory naming** (prefix[-infix]-suffix; approved axes only).

## Adding or changing rules

- **Rule content**: Add or edit only in
  `shared/prompt/store/shared-prompt-store.md` Part B.
- **Apply timing**: To add a new on-request (or always) group, add one mdc that
  references the relevant §; name per §D/§E.
- **Refactor existing mdc**: Follow **§J. Migration boundary** (plan first;
  create new files then remove old; one migration per commit).

## Relation to other docs

- Rule definitions: `shared/prompt/store/shared-prompt-store.md` Part B.
- Directory and document structure: `shared-document-plan.md`; migration history
  and current mapping: `data-migration-strategy.md`.
