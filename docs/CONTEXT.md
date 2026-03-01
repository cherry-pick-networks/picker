---
title: context
description: One-page project context: stack, goal, boundary, and where to read what.
---

# Project context (single read)

One-page summary for onboarding and daily use.\
**Single source of truth for AI and tooling**:
`sharepoint/context/RULESET.md`.\
When writing or editing AI-facing docs in this folder
(except RULESET.md), follow RULESET.md §R.

---

## 1. Project and stack

- **Name**: picker
- **Runtime**: Deno
- **Stack**: Hono (HTTP), Zod (validation), ts-morph (AST),
  PostgreSQL (storage)
- **Entry**: `main.ts` (Hono app, KV routes, AST demo)

---

## 2. Directory structure (summary)

- **Max depth**: 5 components from root. Root is not counted.
- **Allowed forms**: Component 1 only; C1/C2; C1/C2/C3;
  C1/C2/C3/C4; C1/C2/C3/C4/C5 (see RULESET.md §F).
- **Naming**: Use only approved segment names per axis; see
  RULESET.md §E. When Component 1 is a Layer (presentation,
  application, domain, infrastructure), use that layer's
  allowed Component 2 and Component 5 only; see RULESET.md §E.
  Rules summary below references RULESET.md §D–§F.
- **This file**: `sharepoint/context/CONTEXT.md` (sharepoint = Todo,
  context = Entity)
- **Exceptions**: .git, .cursor, node_modules, dist, build,
  coverage, vendor, .cache (confirm per repo)

---

## 3. Run, build, test

- **Dev server**: `deno task dev` (watch mode)
- **Run once**: `deno run -A main.ts` (Postgres required)
- **Test**: `deno test` (add tests and tasks in deno.json as
  needed)
- **Lint/format**: `deno lint`, `deno fmt` (or project
  config if present)

---

## 4. Frequently used commands

| Command                            | Purpose                                        |
| ---------------------------------- | ---------------------------------------------- |
| `deno task dev`                    | Start dev server with watch                    |
| `deno run -A main.ts`              | Run server once (Postgres required)            |
| `deno test`                        | Run tests                                      |
| `gh pr create --draft`             | Create draft PR                                |
| `gh pr view`, `gh pr diff`         | Inspect PR for review                          |
| `gh run view`                      | Inspect CI run                                 |
| `git worktree add <path> <branch>` | Work on another branch in a separate directory |
| `realpath <path>`                  | Resolve absolute path outside current tree     |

Optional tooling (status line, setup script, tips): see
`sharepoint/context/documentation/PRIMER.md`.

---

## 5. Final implementation goal

Single source for PICKER end-state. Use this section to
decide todo, phase, and whether a change aligns with the
target. Details live in the spec (Law) and linked specs.

**One-line goal**: PICKER's final implementation goal is to
implement the **self-evolving AI education architect** as a
single, fully working system within the todo and governance
defined in the spec: AST-based self-edit of
sharepoint/runtime/store/, Thompson Sampling MAB for logic
selection, and Governance verification before any change is
applied.

**Target phases**: Phases (MVP through full spec) and
current target are defined in the spec §49. Implement only
up to the chosen phase; update the spec before implementing
beyond it.

**Todo source**: Modules, API, infrastructure: this repo's
`sharepoint/context/BACKLOG.md`. Product todo, governance: the
spec. Add only modules, routes, or infrastructure listed in
BACKLOG.md or specified in the spec for the current phase.

**In-todo**: In-todo modules, agents, data layout, mutation
rules, selection, and output format are defined in
BACKLOG.md and the spec. Add only items inside that todo.

**Must**: Follow BACKLOG.md and the spec for the current
phase. Run all autonomous mutations and applies through
Governance verification. Add only modules, routes, and
infrastructure listed in todo (BACKLOG.md or spec). Mutate
only within sharepoint/runtime/store/; use Governance-verified
flow. Write to config/ or credentials only via approved
mechanisms; file-based sharepoint/record/ (identity_index only)
only via application/record/identityIndexStore.ts (see
BACKLOG.md). Apply type-check policy (RULESET.md §N).
Concretes: spec §44–§48 and RULESET.md.

**References**: The spec (overview, governance, agents, data
layout, protocol, implementation and safety). This repo:
sharepoint/context/BACKLOG.md, sharepoint/context/RULESET.md.
Minimal-scope plan: sharepoint/context/documentation/MANUAL.md §
API and Copilot scope (copilot-assisted only, legacy removal
phases). Other specs: web_spec, llm_models_spec (when
present).

---

## 6. Boundary (infrastructure and API scope)

Single reference for infrastructure and API scope rules. See
RULESET.md §K for todo boundary; this section defines
domain-scope constraints.

**Ontology (Scope 1)**: Seeds:
`sharepoint/infra/seed/ontology/seed.sql` (reserved),
`sharepoint/infra/seed/ontology/global_standards.toml` (single
definition: isced, iscedf, bloom, cefr, actfl, doctype).
Validation: Facet IDs (subjectIds, contextIds, etc.) must
strictly belong to their designated concept_scheme. Bulk ID
checks capped at 500. Graph constraints: DAG checks strictly
enforced for `requires` relation_type only.

**Material source seed (Scope 2)**: Serialization rationale
only in repo: `sharepoint/infra/seed/material/material_sources.toml`
lists source_id and env_var; no copyright-sensitive content
(titles, entry counts) in repo. Sensitive data in .env: Set
`SOURCE_META_*` (names in material_sources.toml) to JSON
`{ "type", "metadata" }`; seed runner reads at runtime
(`deno task seed:material`).

---

## 7. Where to read what

- **Rules (checkable)**: See Rules summary below; canonical
  source `sharepoint/context/RULESET.md` Part B.
- **Reference (tips, not rules)**:
  `sharepoint/context/documentation/PRIMER.md`
- **Cursor chat commands** (Cursor only; slash command list
  and when to use): `sharepoint/context/documentation/PRIMER.md`
  § Cursor chat commands (project). For other editors: §
  Using rules without Cursor.
- **Handoff**: `sharepoint/context/HANDOFF.md` (linked from
  README)
- **Todo** (modules, API, infra):
  `sharepoint/context/BACKLOG.md`
- **AI/tool single source**: `sharepoint/context/RULESET.md`
- **Rule digest** (always-applied § for agents):
  `sharepoint/context/SUMMARY.md`

---

## 8. Rule application flow

- **Always** (Cursor): global-core.mdc applies §C, §I, §O
  (and §B for handoff). No other rule text is duplicated in
  .mdc.
- **By context**: Which § apply is in RULESET.md "Rule index
  (context → sections)". Run
  `deno task rules:summary -- <task-type>` to get the list
  and one-line titles (works from any editor). In Cursor,
  you can also use the matching skill from
  `.cursor/skills/`.
- **Heavy verification**: In Cursor, use a subagent; see
  "Subagents for rules" in PRIMER.md. Elsewhere, run
  rules:summary and check the change against the cited §
  using RULESET.md.

---

## 9. Rules summary (checkable)

Rules that can be checked or defined as "this repo has X".\
**Canonical source**: `sharepoint/context/RULESET.md` Part B
(§A–§R).\
Read RULESET.md for full definitions; do not duplicate rule
text here.\
When using Cursor, `.cursor/rules/*.mdc` define **when**
each § applies.

---

## 10. Reference vs rules

- **Rules**: Stored in RULESET.md Part B; checkable
  (directory structure, naming, commit format, todo). Use
  RULESET.md when you need the exact rule text.
- **Reference**: `sharepoint/context/documentation/PRIMER.md`
  holds usage tips and workflow habits; not checkable; for
  team or personal use.
- **When in doubt**: State it as "Do X" with a concrete,
  checkable outcome and put it in RULESET.md; otherwise keep
  it in documentation/PRIMER.md.
