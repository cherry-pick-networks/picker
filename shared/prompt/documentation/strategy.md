# Data migration strategy — shared single source

## Goal

- **Single source**: All rule text lives in `shared/prompt/store.md` (Part B:
  Rule definitions).
- **Cursor Rules**: `.cursor/rules/*.mdc` only reference that file; no duplicate
  rule text. mdc files are for **when** to apply (always vs on-request).

## Current layout (after simplification)

- **Two mdc files**: one always-applied (`global-agent-policy.mdc`), one
  on-request (`global-directory-boundary.mdc`). See `cursor-rules-policy.md`.

## Scope (historical)

- **Source**: 12 files under `.cursor/rules/*.mdc` (pre-simplification).
- **Target**: `shared/prompt/store.md` (expand with §A–§L).
- **No**: New deps, scope doc changes, or module/API/infra changes.

## Phases

| Phase | Action                                                | Commit                                                                |
| ----- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| 0     | Add this strategy doc                                 | docs(shared/prompt): add data migration strategy                      |
| 1     | Move full rule text from 12 .mdc into store.md Part B | refactor(shared/prompt): move rule definitions into store.md          |
| 2     | Replace each .mdc body with reference to store.md §X  | refactor(.cursor/rules): replace rule text with reference to store.md |
| 3     | Verify completeness and update documentation          | docs(shared/prompt): verify single-source migration                   |

## Rule → section mapping

### Current (after simplification)

| §        | Section ID                         | .mdc                                       |
| -------- | ---------------------------------- | ------------------------------------------ |
| A–E, G–L | (all except F)                     | global-agent-policy.mdc (always)           |
| F        | Directory structure and exceptions | global-directory-boundary.mdc (on-request) |

### Historical (pre-simplification)

| § | Section ID                         | Source .mdc                    |
| - | ---------------------------------- | ------------------------------ |
| A | Commit message format              | global-event-format.mdc        |
| B | Commit and session boundary        | global-agent-boundary.mdc      |
| C | Language                           | global-document-language.mdc   |
| D | Document and directory format      | global-document-format.mdc     |
| E | Document and directory naming      | global-document-naming.mdc     |
| F | Directory structure and exceptions | global-directory-boundary.mdc  |
| G | Dependency constraint              | global-document-constraint.mdc |
| H | Validation policy (libraries)      | global-validation-policy.mdc   |
| I | Agent principles                   | global-agent-principle.mdc     |
| J | Migration boundary                 | global-migration-boundary.mdc  |
| K | Scope document boundary            | system-document-boundary.mdc   |
| L | Agent and scope                    | system-agent-boundary.mdc      |

## Rollback

- Revert Phase 1 commit to restore store.md.
- Revert Phase 2 commit to restore .mdc rule text.

## Done criteria

- [x] store.md contains full text of all 12 rules (§A–§L).
- [x] Each .mdc contains only a reference to store.md (no rule body).
- [x] No duplicate long-form rule content in .mdc.
- [x] Exactly two .mdc files; one always-applied, one on-request. See
      cursor-rules-policy.md.

---

# 4-layer naming reference

When the first directory tier is a Layer (presentation, application, domain,
infrastructure), tier 2 and tier 3 must use only that layer's allowed Infix and
Suffix. Canonical source: store.md §E. Below is a quick reference.

| Layer          | Allowed Infix                                                                                                                                                                             | Allowed Suffix                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| presentation   | router, facade, interceptor, filter, guard, client, validator, payload, session, document                                                                                                 | endpoint, response, config, format, middleware, exception, trace, boundary, validation       |
| application    | service, facade, agent, worker, guard, validator, payload, session, document, record, read, write, batch, parse, search, validate, migration, recovery                                    | pipeline, config, event, store, metrics, trace, boundary, constraint, validation, compliance |
| domain         | entity, repository, service, record, document, validate                                                                                                                                   | schema, event, boundary, constraint, contract, principle, types                              |
| infrastructure | adapter, client, repository, agent, worker, blob, cache, session, record, json, sql, redis, stream, document, bootstrap, shutdown, read, write, batch, migration, recovery, parse, upload | store, storage, config, mapping, pipeline, metrics, trace, log, boundary, isolation          |

---

# AI-assisted scope estimation

Guideline for sizing AI-assisted coding sessions in micro-component (small-file,
short-function) codebases. Use when giving the AI a multi-file task or when
defining session boundaries.

## Rule (single source)

**One session = one entry file + the files it directly imports.** Do not use a
fixed file-count limit (e.g. "3–4 files"). Define types/interfaces used in that
tree first, then implement. Do not combine unrelated trees or project-wide
refactors in one session.

## When it applies

- File size is small (e.g. &lt;100 lines per file).
- Functions are short (e.g. ≤6 lines); single responsibility.
- Many small files form a "ravioli" structure.

In that environment the main failure mode is **connection complexity** (imports,
props, DI), not token count. Scoping by dependency tree reduces mistakes.

## Recommended workflow

1. Choose or create **one entry file** for the feature (e.g. the route or
   top-level component).
2. Run the scope-discovery script to list its direct imports (see below).
3. Prompt the AI with that list as the in-scope set. Between each step
   (requirement summary → interface proposal → implementation), proceed only
   after **user approval**; see store.md §Q.
4. (Optional) Before commit, check that changed files are within entry + script
   output (manual or via optional check script).

## Scope-discovery script

From repo root:

```bash
deno run --allow-read shared/prompt/scripts/scope-discovery.ts <entry-file>
```

Example:

```bash
deno run --allow-read shared/prompt/scripts/scope-discovery.ts system/router/home.ts
```

Output: the entry path plus one path per line for each file it **directly**
imports (relative imports only; npm/jsr are skipped). Use this list as the
"in-scope files" in your prompt. Optional: `--oneline` prints a single line for
pasting into the prompt.

Task: `deno task scope-discovery -- <entry-file>` (e.g.
`deno task scope-discovery -- system/router/home.ts`). Add `--oneline` for
one-line output.

## Phase flags (explicit prompt flags)

Put one of these at the **first line** (or a clear, fixed position) of the
prompt so the agent knows the current phase:

- **`[Phase 1]`** — When stating the requirement. AI outputs only a
  requirement/constraint summary, then asks for approval and waits.
- **`[Phase 2]`** — After phase 1 is approved. AI proposes only
  `interface`/`type` for the tree, then asks for approval and waits.
- **`[Phase 3]`** — After phase 2 is approved. AI implements logic and view per
  the approved design.

## Prompt template

Use the script output and phase when filling the prompt:

```
Phase: [1 | 2 | 3]. If 1: summarize requirement only. If 2: propose only interfaces/types. If 3: implement per approved design.
Entry file: <path>
In-scope files (do not modify others): <paste script output>
Task: <one sentence>
Order: define types/interfaces used in this tree first, then implement.
```

## What to avoid

- "Change all buttons / colors / variable names across the project" in one
  session.
- Editing multiple unrelated feature trees in one session.
- Omitting the in-scope list so the model infers scope itself (often wrong).

## Optional: scope-drift check

Before commit you can verify that changed files are a subset of entry + direct
dependents. Not enforced by default; add a small script or manual checklist if
desired.
