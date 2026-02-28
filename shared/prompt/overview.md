---
title: overview
description: One-page summary for onboarding and daily use.
---

# Project context (human-readable)

One-page summary for onboarding and daily use.\
**Single source of truth for AI and tooling**: `shared/prompt/store.md`.\
When writing or editing AI-facing docs in this folder (except store.md), follow
store.md §R.

---

## Project and stack

- **Name**: picker
- **Runtime**: Deno
- **Stack**: Hono (HTTP), Zod (validation), ts-morph (AST), PostgreSQL (storage)
- **Entry**: `main.ts` (Hono app, KV routes, AST demo)

---

## Directory structure (summary)

- **Max depth**: 3 tiers from root (prefix → infix → suffix). Root is not
  counted.
- **Allowed forms**: `prefix/`, `prefix/infix/`, `prefix/infix/suffix/`
- **Naming**: Use only approved segment names per axis; see store.md §E. When
  the first tier is a Layer (presentation, application, domain, infrastructure),
  use that layer's allowed Infix/Suffix only; see store.md §E. Rules summary
  below references store.md §D–§F.
- **This file**: `shared/prompt/overview.md` (shared = Todo, prompt = Entity,
  overview = Meta)
- **Exceptions**: .git, .cursor, node_modules, dist, build, coverage, vendor,
  .cache (confirm per repo)

---

## Run, build, test

- **Dev server**: `deno task dev` (watch mode)
- **Run once**: `deno run -A main.ts` (Postgres required)
- **Test**: `deno test` (add tests and tasks in deno.json as needed)
- **Lint/format**: `deno lint`, `deno fmt` (or project config if present)

---

## Frequently used commands

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
`shared/prompt/documentation/guide.md`.

---

## Where to read what

- **Rules (checkable)**: See Rules summary below; canonical source
  `shared/prompt/store.md` Part B.
- **Reference (tips, not rules)**: `shared/prompt/documentation/guide.md`
- **Cursor chat commands** (Cursor only; slash command list and when to use):
  `shared/prompt/documentation/guide.md` § Cursor chat commands (project). For
  other editors: § Using rules without Cursor.
- **Handoff**: `shared/prompt/handoff.md` (linked from README)
- **Todo** (modules, API, infra): `shared/prompt/to-do.md`
- **Final goal** (for AI): `shared/prompt/goal.md`
- **AI/tool single source**: `shared/prompt/store.md`

---

## Rule application flow

- **Always** (Cursor): global-core.mdc applies §C, §I, §O (and §B for handoff).
  No other rule text is duplicated in .mdc.
- **By context**: Which § apply is in store.md "Rule index (context →
  sections)". Run `deno task rules:summary -- <task-type>` to get the list and
  one-line titles (works from any editor). In Cursor, you can also use the
  matching skill from `.cursor/skills/`.
- **Heavy verification**: In Cursor, use a subagent; see "Subagents for rules"
  in guide.md. Elsewhere, run rules:summary and check the change against the
  cited § using store.md.

---

## Rules summary (checkable)

Rules that can be checked or defined as "this repo has X".\
**Canonical source**: `shared/prompt/store.md` Part B (§A–§R).\
Read store.md for full definitions; do not duplicate rule text here.\
When using Cursor, `.cursor/rules/*.mdc` define **when** each § applies.

---

## Reference vs rules

- **Rules**: Stored in store.md Part B; checkable (directory structure, naming,
  commit format, todo). Use store.md when you need the exact rule text.
- **Reference**: `shared/prompt/documentation/guide.md` holds usage tips and
  workflow habits; not checkable; for team or personal use.
- **When in doubt**: State it as "Do X" with a concrete, checkable outcome and
  put it in store.md; otherwise keep it in documentation/guide.md.
