# Project context (human-readable)

One-page summary for onboarding and daily use.\
**Single source of truth for AI and tooling**: `shared/prompt/store.md`.\
When writing or editing AI-facing docs in this folder, follow store.md §R.

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
  prefix; Actor/Action/Entity for infix; Artifact/Policy/Meta for suffix). The
  same names are the approved vocabulary at each tier (files, subfolders,
  modules, symbols); see §E. Rules summary below (§D–§F).
- **This file**: `shared/prompt/overview.md` (shared = Scope, prompt = Entity,
  overview = Meta)
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
`shared/prompt/documentation/guide.md`.

---

## Where to read what

- **Rules (checkable)**: See Rules summary below; canonical source
  `shared/prompt/store.md` Part B.
- **Reference (tips, not rules)**: `shared/prompt/documentation/guide.md`
- **Handoff**: `shared/prompt/handoff.md` (linked from README)
- **Scope** (modules, API, infra): `shared/prompt/boundary.md`
- **Final goal** (for AI): `shared/prompt/goal.md`
- **AI/tool single source**: `shared/prompt/store.md`

---

## Rules summary (checkable)

Rules that can be checked or defined as "this repo has X".\
**Canonical source**: `shared/prompt/store.md` Part B.\
`.cursor/rules/*.mdc` only define **when** to apply; they do not duplicate this
text.

### §A. Commit message format

- **Pattern**: `<type>[(scope)]: <description>`; type and description required;
  scope optional.
- **Types**: feat, fix, docs, chore, refactor, perf, test, ci, build. Use
  BREAKING CHANGE in footer or `type!` for MAJOR.
- **Description**: Imperative, lowercase after colon; optional body after blank
  line.
- **Check**: Commit message matches the pattern; type is from the allowed list.

Example: `feat(module): add handler`

### §B. Commit and session boundary

- Commit at each feature-flag (or logical unit) boundary; do not batch commits
  at the end.
- Before starting the next unit, run `git add` and `git commit` for the current
  changes.
- **Check**: Commits exist at boundaries; no large uncommitted work spanning
  multiple flags.

### §C. Language

- English only for code, comments, docstrings, UI/log strings, and docs.
- **Check**: No non-English in those artifacts (or documented exceptions).

### §D. Document and directory format

- **Rule files**: Name as `[prefix]-[suffix].mdc` or
  `[prefix]-[infix]-[suffix].mdc`; lowercase, one hyphen between words.
- **Document files**: Under shared/prompt/, use [suffix].md only; see store §D
  and §E.
- **Directories**: Max 3 tiers from root (prefix → infix → suffix). Allowed
  forms: `prefix/`, `prefix/infix/`, `prefix/infix/suffix/`.
- **Check**: New directories (except exception list) match the three forms; rule
  and document file names follow the pattern.

### §E. Document and directory naming

- Each segment uses one axis only: Prefix (Scope / Layer / Context), Infix
  (Actor / Action / Entity), Suffix (Artifact / Policy / Meta).
- The same axis allowed values are the approved names for that tier and below
  (files, subfolders, modules, symbols); folder and rule/doc naming are
  mandatory per §D/§F.
- Use the clean dictionary (e.g. config not configuration; cache only as Infix;
  core forbidden in Context). See store.md §E for full lists.
- **Check**: Segment names come from the approved sets; no forbidden or
  duplicate-axis usage.

### §F. Directory structure and exceptions

- All non-excepted directories must follow prefix / infix / suffix order; no
  fourth tier.
- **Exceptions**: .git, .cursor, node_modules, dist, build, coverage, vendor,
  .cache (confirm per project).
- **Document exceptions**: For .md segment naming, see store §F (fixed names
  e.g. README.md, CHANGELOG.md; optional single path). Do not duplicate the list
  here.
- **Check**: Directory walk (excluding exceptions) validates structure and
  naming; optional pre-commit or CI script.

### §G. Dependency constraint

- Do not add dependencies unless (a) on the project official list (e.g.
  deno.json), or (b) the addition meets stable-library criteria and is approved.
- **Check**: New deps appear in the official list or in an approved change; no
  unlisted imports.

### §H. Validation policy (libraries)

- New libraries must satisfy mandatory criteria: recent release, docs URL,
  allowed license, no Critical/High CVE, single clear purpose. CI audit when
  applicable.
- **Check**: Dependency audit in CI; new deps documented with license and
  source.

### §I. Agent principles (summary)

- Follow conventions; prefer simplest option (KISS); leave code cleaner; fix
  root cause; be consistent; positive phrasing in docs.
- **Rules vs guidance**: Add to rules only what is (1) stateable as must/do
  not/only, (2) concrete in scope, (3) detectable; otherwise keep in docs or
  reference.
- No speculative implementation; scope is in shared/prompt/boundary.md.

### §J. Migration boundary

- Refactor rule files that mix axes or use forbidden segments; write a migration
  plan first (target names, content per file, files to remove).
- Create new files first, then delete old; one migration per commit. Scope doc
  unchanged for rule-only refactors.

### §K. Scope document boundary

- **Single source**: shared/prompt/boundary.md for in-scope modules, API
  surface, infrastructure.
- Do not add new modules, API routes, or infrastructure unless listed there;
  update shared/prompt/boundary.md first, then implement.
- **Check**: New routes/modules/infra have a corresponding scope doc update.

### §L. Agent and scope

- Agent must not extend scope arbitrarily; propose scope doc changes for
  approval, then implement after update.

### §M. Root README boundary

- Root README Documentation section: only domain entry points (links to
  scope-level READMEs, e.g. shared/README.md); no deep links to files under a
  scope.
- **Check**: Root README has no links to e.g. shared/prompt/... ; only to
  shared/README.md (and other scope READMEs if any).

---

## Reference vs rules

**Reference material** (in `documentation/guide.md`) is for team or personal
use only. Nothing there is a rule or checklist; compliance is not checked.

- **Rules** (above): Things that can be checked (directory structure, naming,
  commit format, "this repo has X file") or defined in one sentence.
- **Reference**: Usage tips, workflow habits, tool preferences—things that are
  not checkable or that depend on the person or environment.

When in doubt: if you cannot state it as "do X / do not Y" with a concrete,
checkable outcome, keep it in `documentation/guide.md`, not in the rules.
