# Project context (human-readable)

One-page summary for onboarding and daily use.\
**Single source of truth for AI and tooling**: `shared/prompt/store/context.md`.

---

## Project and stack

- **Name**: {{repo_name}}
- **Runtime**: Deno
- **Stack**: Hono (HTTP), Zod (validation), ts-morph (AST), Deno KV (storage)
- **Entry**: `main.ts` (Hono app, KV routes, AST demo)

---

## Directory structure (summary)

- **Max depth**: 3 tiers from root (prefix → infix → suffix). Root is not
  counted.
- **Allowed forms**: `prefix/`, `prefix/infix/`, `prefix/infix/suffix/`
- **Naming**: Use only approved segment names per axis (Scope/Layer/Context for
  prefix; Actor/Action/Entity for infix; Artifact/Policy/Meta for suffix). See
  `shared/prompt/documentation/conventions-rules.md` §D–§F.
- **This file**: `shared/prompt/documentation/project-context.md` (shared =
  Scope, prompt = Entity, documentation = Meta)
- **Exceptions**: .git, .cursor, node_modules, dist, build, coverage, vendor,
  .cache (confirm per repo)

---

## Run, build, test

- **Dev server**: `deno task dev` (watch mode)
- **Run once**: `deno run --allow-net --unstable-kv main.ts`
- **Test**: `deno test` (add tests and tasks in deno.json as needed)
- **Lint/format**: `deno lint`, `deno fmt` (or project config if present)

---

## Frequently used commands

| Command                                      | Purpose                                        |
| -------------------------------------------- | ---------------------------------------------- |
| `deno task dev`                              | Start dev server with watch                    |
| `deno run --allow-net --unstable-kv main.ts` | Run server once                                |
| `deno test`                                  | Run tests                                      |
| `gh pr create --draft`                       | Create draft PR                                |
| `gh pr view`, `gh pr diff`                   | Inspect PR for review                          |
| `gh run view`                                | Inspect CI run                                 |
| `git worktree add <path> <branch>`           | Work on another branch in a separate directory |
| `realpath <path>`                            | Resolve absolute path outside current tree     |

Optional tooling (status line, setup script, tips): see
`shared/prompt/documentation/reference.md` and
`shared/prompt/documentation/tips-usage.md`.

---

## Where to read what

- **Rules (checkable)**: `shared/prompt/documentation/conventions-rules.md`
- **Reference (tips, not rules)**: `shared/prompt/documentation/reference.md`,
  `shared/prompt/documentation/tips-usage.md`
- **Handoff**: `shared/prompt/documentation/handoff.md` (linked from README)
- **Scope** (modules, API, infra): `shared/prompt/documentation/scope.md`
- **AI/tool single source**: `shared/prompt/store/context.md`
