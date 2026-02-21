# Data migration strategy — shared single source

## Goal

- **Single source**: All rule text lives in `shared/prompt/store/context.md` (Part B: Rule definitions).
- **Cursor Rules**: `.cursor/rules/*.mdc` only reference that file; no duplicate rule text. mdc files are for **when** to apply (always vs on-request).

## Current layout (after simplification)

- **Two mdc files**: one always-applied (`global-agent-policy.mdc`), one on-request (`global-directory-boundary.mdc`). See `cursor-rules-policy.md`.

## Scope (historical)

- **Source**: 12 files under `.cursor/rules/*.mdc` (pre-simplification).
- **Target**: `shared/prompt/store/context.md` (expand with §A–§L).
- **No**: New deps, scope doc changes, or module/API/infra changes.

## Phases

| Phase | Action | Commit |
|-------|--------|--------|
| 0 | Add this strategy doc | docs(shared/prompt): add data migration strategy |
| 1 | Move full rule text from 12 .mdc into context.md Part B | refactor(shared/prompt): move rule definitions into context.md |
| 2 | Replace each .mdc body with reference to context.md §X | refactor(.cursor/rules): replace rule text with reference to context.md |
| 3 | Verify completeness and update implementation-plan | docs(shared/prompt): verify single-source migration |

## Rule → section mapping

### Current (after simplification)

| § | Section ID | .mdc |
|---|-------------|------|
| A–E, G–L | (all except F) | global-agent-policy.mdc (always) |
| F | Directory structure and exceptions | global-directory-boundary.mdc (on-request) |

### Historical (pre-simplification)

| § | Section ID | Source .mdc |
|---|-------------|-------------|
| A | Commit message format | global-event-format.mdc |
| B | Commit and session boundary | global-agent-boundary.mdc |
| C | Language | global-document-language.mdc |
| D | Document and directory format | global-document-format.mdc |
| E | Document and directory naming | global-document-naming.mdc |
| F | Directory structure and exceptions | global-directory-boundary.mdc |
| G | Dependency constraint | global-document-constraint.mdc |
| H | Validation policy (libraries) | global-validation-policy.mdc |
| I | Agent principles | global-agent-principle.mdc |
| J | Migration boundary | global-migration-boundary.mdc |
| K | Scope document boundary | system-document-boundary.mdc |
| L | Agent and scope | system-agent-boundary.mdc |

## Rollback

- Revert Phase 1 commit to restore context.md.
- Revert Phase 2 commit to restore .mdc rule text.

## Done criteria

- [x] context.md contains full text of all 12 rules (§A–§L).
- [x] Each .mdc contains only a reference to context.md (no rule body).
- [x] No duplicate long-form rule content in .mdc.
- [x] Exactly two .mdc files; one always-applied, one on-request. See cursor-rules-policy.md.
