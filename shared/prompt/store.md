---
title: store
description: Single source of truth for project description, structure, conventions, and workflow.
---

# Project context (AI / tooling)

Single source of truth for project description, structure, conventions, and
workflow.\
All tools and models should use this file only; do not duplicate these rules in
tool-specific configs.

---

## 1. Project and stack

- **Name**: picker
- **Runtime**: Deno
- **Stack**: Hono (HTTP), Zod (validation), ts-morph (AST), PostgreSQL (storage)
- **Entry**: `main.ts` (Hono app, routes from system/routes.ts)

---

## 2. Directory structure and naming

- **Max depth**: 3 tiers from root (prefix → infix → suffix). Root is not
  counted.
- **Allowed forms**: `prefix/`, `prefix/infix/`, `prefix/infix/suffix/`
- **Naming axes** (use only approved segment names):
  - **Prefix**: Scope (global, shared, system, module, component) or Layer or
    Context
  - **Infix**: Actor, Action, or Entity (e.g. prompt, document, service)
  - **Suffix**: Artifact, Policy, or Meta (e.g. store, config, test)
- **This file**: `shared/prompt/store.md` (shared = Scope, prompt = Entity;
  store as artifact naming in filename)
- **Exceptions**: .git, .cursor, node_modules, dist, build, coverage, vendor,
  .cache, temp, tests (confirm per repo)
- Do not add a fourth tier. Do not use forbidden segments (e.g. core in Context;
  cache as Suffix).
- **Data and document format**: Data files use TOML (`.toml`), UTF-8; parse with
  `@std/toml`. File names follow §E; record files are `{uuid}.toml`. Documents
  use Markdown (`.md`) or Cursor rules (`.mdc`) with optional YAML front matter;
  parse with `@std/front-matter`. Data file paths: see
  `shared/prompt/boundary.md`.

---

## 3. Run, build, test

- **Dev server**: `deno task dev` (runs `deno run -A --watch main.ts`).
  Postgres connection required (e.g. env `DATABASE_URL`).
- **Run once**: `deno run -A main.ts` (Postgres required).
- **Test**: Add and run tests via `deno test`; keep commands in `deno.json`
  tasks if needed. Tests that use storage require Postgres: run
  `deno task db:schema` once when the DB is up.
- **Lint/format**: Use project lint/format config if present; otherwise
  `deno lint`, `deno fmt`.

---

## 4. Coding and commit conventions

- **Language**: English only for code, comments, docstrings, UI/log strings, and
  docs.
- **Commit message**: `<type>[(scope)]: <description>`; imperative, lowercase.\
  Types: feat, fix, docs, chore, refactor, perf, test, ci, build. Scope optional
  (e.g. module or feature flag).
- **Dependencies**: Add only from the project's official list (e.g. deno.json
  imports); update that list first. No new deps without approval and
  stable-library criteria.
- **Scope**: Do not add modules, API routes, or infrastructure unless they are
  in the scope document; update the scope doc first, then implement.
- **Conventions**: Follow existing formatting, naming, and structure; prefer the
  simplest option (KISS); be consistent.

---

## 5. Frequently used commands

- `deno task dev` — start dev server with watch
- `deno run -A main.ts` — run server once (Postgres required)
- `deno test` — run tests
- `deno task scope-check` — verify API routes are listed in
  shared/prompt/boundary.md (runs in CI)
- `deno task type-check-policy` — verify no type-check bypass (runs in CI)
- `deno task dependency-check` — verify acyclic domain deps and allowed matrix
  (runs in CI)
- `deno task naming-layer-check` — verify layer-prefixed paths use allowed
  infix/suffix per §E (optional; run in pre-commit or CI)
- `deno task ts-filename-check` — verify system/, shared/infra, and tests/ TS
  filenames per §E and reference.md (optional; run in pre-commit or CI)
- `deno task sql-filename-check` — verify shared/infra/schema/*.sql per
  reference.md (Schema DDL file naming) (optional; run in pre-commit or CI)
- `deno task pre-push` — run before push; same as CI (lint, fmt, line-length,
  ts-filename-check, sql-filename-check, test, scope-check, boundary-check,
  dependency-check, type-check-policy, audit)
- `deno task scope-discovery -- <entry-file>` — list direct imports for AI
  session scope (see shared/prompt/documentation/strategy.md)
- `gh pr create --draft` — create draft PR (review before marking ready)
- `gh pr view`, `gh pr diff` — inspect PR for review
- `gh run view` — inspect CI run (e.g. after failure)
- `git worktree add <path> <branch>` — work on another branch in a separate
  directory
- `realpath <path>` — resolve absolute path when referring to files outside
  current tree
- **Optional**: Status line `shared/prompt/scripts/context-bar.sh`; setup
  `shared/prompt/scripts/setup.sh`; see `shared/prompt/documentation/guide.md`
  for tips-derived options (3rd layer).

---

## 6. Development workflow

- **Decompose**: Break large work into small steps (A → A1, A2, A3 → B). Tackle
  one step at a time.
- **Plan then prototype**: Decide high-level approach and structure before
  coding; use a short plan or prototype to validate approach.
- **Write–test cycle**: Implement, run tests (or manual check), fix failures,
  repeat. For automation, define how to verify results.
- **Tests and TDD**: Prefer writing tests (failing first), committing the test
  change, then implementing until they pass. Treat tests and this TDD cycle as
  the default for non-trivial code.
- **Verify output**: For research or non-code output, ask to verify claims and
  summarize (e.g. table of what was verified).
- **Phase-gated feature cycle (recommended when implementing features)**: For
  one small feature unit (entry file + direct imports), follow four phases: (1)
  Requirement — AI outputs only a short requirement/constraint summary; gate:
  stop generation, ask user approval, do not proceed to phase 2 until explicit
  approval. (2) Interface design — AI proposes only `interface`/`type` for that
  tree, no implementation or JSX; gate: stop, ask approval of the design, do not
  write implementation until approved. (3) Implementation — code per §P (file
  ≤100 effective lines, function body 2–4 effective lines). (4) Test and commit
  — add or update tests, then commit per §B. One cycle = one entry file + its
  direct imports; see shared/prompt/documentation/strategy.md for
  scope-discovery and prompt template. Optionally: after phase 2 approval,
  writing a failing test before phase 3 is allowed (TDD); state this in the same
  workflow.

---

## 7. Git, PR, CI

- Use **Git** and **GitHub CLI (`gh`)** for commits, branches, pull, and PRs.
  Any AI that can run the terminal uses the same commands.
- **Draft PRs**: Create with `gh pr create --draft`; review; then mark ready.
  Prefer draft PRs for agent-generated changes.
- **Parallel work**: Use `git worktree add` when working on multiple branches;
  one worktree per branch/dir.
- **PR review**: Use `gh pr view` and `gh pr diff`; review file-by-file or
  step-by-step as needed.
- **Before push or PR**: Run `deno task pre-push` so CI passes. Code must
  satisfy §P (function body 2–4 statements; async only when body uses await).
- **Pre-commit hook (optional)**: To run `deno lint`, `deno fmt --check`, and
  `deno task line-length-check` on commit, set
  `git config core.hooksPath .githooks` and `chmod +x .githooks/pre-commit`.
- **CI failure**: Use `gh run view`, logs, and (if needed) `gh` GraphQL/API to
  find root cause, flakiness, or breaking commit.
- **Dangerous commands**: Audit approved commands periodically (e.g. patterns
  like `rm -rf`, `sudo`, `chmod 777`, `curl | sh`, `git reset --hard`). Run
  **cc-safe** (e.g. `npx cc-safe .`) on a schedule (e.g. before opening a PR,
  monthly). Prefer a script or checklist; do not approve broad destructive
  permissions.

---

## 8. Integrations and long-running work

- **MCP**: Prefer MCP servers for integrations so any MCP-capable client can
  reuse them when the model or client changes.
- **Browser automation**: Use Playwright (or similar); document usage here if
  the project uses it.
- **Paths**: When referring to files outside the current tree, use `realpath`
  (or equivalent) to pass absolute paths.
- **Long-running jobs**: For CI/build or external waits, use manual exponential
  backoff (e.g. check at 1m, 2m, 4m, …) instead of one long wait.

---

## 9. Context and handoff

- **New topic**: Start a new conversation when the topic or task changes to keep
  context focused.
- **Handoff**: For long-running or multi-session work, write a single handoff
  doc (`shared/prompt/handoff.md`; linked from README) with: goal, progress,
  what was tried, what failed, next steps. **Workflow**: create or update the
  handoff file before switching agent or topic; new sessions attach only that
  file. Optionally use `/handoff` (e.g. dx plugin) if available.
- **Next steps (handoff)**: In the handoff doc, the "Next steps" section lists
  zero or more follow-up actions. Each item is one logical unit (one commit or
  one scoped task); one sentence per item so a new session can start without
  extra context. If there is no required follow-up, add at least one optional or
  deferred item (e.g. "Optional: add E2E for POST /kv") so the next session has
  a starting point. Do not add items that require a scope-doc or dependency
  change without noting it (e.g. "Propose scope update first, then implement
  X"). Format: bullet list; first bullet may be the recommended next action.
- **Branching experiments**: When trying a different approach from a point in
  time, fork the conversation or record the branch point in the handoff doc.
- **Session start (first message)**: When starting a new agent or chat session,
  the first user message should be a single short sentence in English that
  states the session goal (one task or one question). This improves
  auto-generated chat titles (e.g. in Cursor). Prefer under 15 words or about 40
  characters. Example: "Add scope validation to POST /content/worksheets API".
  Full procedure and examples: `shared/prompt/documentation/guide.md` (Session
  start).

---

## 10. Input and output

- **Inaccessible or private content**: If a URL or resource cannot be fetched
  directly, use "select all → copy → paste" into the chat (or attach the file).
  For blocked or paywalled sites (e.g. Reddit), use a fallback (e.g.
  reddit-fetch skill or Gemini CLI); see `shared/prompt/documentation/guide.md`
  if used.
- **Output format**: Prefer Markdown for reports and docs; use a neutral format
  (e.g. paste via Notion) when copying to platforms that do not accept Markdown.
- **Getting output out**: Copy from terminal, or write to a file and open in
  editor; use `/copy` or equivalent if the tool provides it.

---

## 11. Quality and safety

- **Abstraction level**: Choose the right depth: high-level for one-off or
  low-risk work; file/function/deps-level for critical or complex code.
- **Simplify**: Ask "why this change?" or "simplify unnecessary parts" when the
  change set is large or unclear. Prefer minimal, clear code and prose.
- **Type-check policy**: Do not disable or bypass type checking. Do not add
  --no-check (or equivalent) to any deno task or run command; do not set
  skipLibCheck or disable strict mode in tsconfig; do not use // @ts-ignore or
  // @ts-expect-error. Fix type errors by correcting types or code (see §N).
- **Dangerous commands**: Do not approve broad or destructive commands without
  explicit need; audit approved commands periodically (see §7).

---

## 12. Maintenance

- **Single source**: Add or change rules and habits only in this file
  (`shared/prompt/store.md`). Do not duplicate in Cursor Rules or other tool
  configs; reference this file instead.
- **.cursor/rules**: mdc files are for **when** to apply (e.g. always vs
  on-request); keep one file per apply timing. Rule text stays here only; mdc
  names follow §D and §E.
- **Review**: Review this file periodically (e.g. quarterly); add repeated
  instructions as they appear; remove or update outdated lines. Use recent
  conversations to propose new lines (repeated instructions from chats →
  candidates for store.md); optionally use a review skill (e.g. review-claudemd)
  if available.
- **External tips**: Use external guides (e.g. claude-code-tips) as reference
  only; write only the chosen practices here.
- **Human-readable docs**: Project summary and rules for people are in
  `shared/prompt/` (2nd layer: overview.md) and `shared/prompt/documentation/`
  (3rd layer: guide, strategy; allowed names reference, usage, strategy, guide,
  runbook). Root README Documentation section lists only domain entry points
  (e.g. shared/README.md); do not add deep links to docs there. Do not duplicate
  rule text in root README.
- **AI-facing docs**: When writing or editing .md under shared/prompt/ (except
  store.md and documentation/), follow §R.

---

## Part B. Rule definitions (authoritative)

Cursor Rules (`.cursor/rules/*.mdc`) reference these sections only; they do not
duplicate the text below. The role of each mdc is to define **when** to apply
(e.g. alwaysApply). Rule content lives only in this file; mdc bodies list which
§ to follow. Keep the number of mdc files aligned with apply timings (e.g. one
always-applied bundle, one on-request).

### §A. Commit message format

Pattern:
<type>[optional scope]: <description>; type and description required; scope
optional. Types: feat (new feature), fix (bug fix), docs, chore, refactor, perf,
test, ci, build; use feat for SemVer MINOR, fix for PATCH; use BREAKING CHANGE
in footer or type! for MAJOR. Scope: use for feature flag or module (e.g.
ff/CHECKOUT_STEP or module name) when the commit is scoped to that unit.
Description: imperative, lowercase after colon; short summary (e.g. add handler,
fix validation); optional body after blank line for context. Footer: BREAKING
CHANGE: <description> or conventional footers (e.g. Ref: TICKET-1).

### §B. Commit and session boundary

When to commit (mandatory): commit at each feature-flag boundary; do not wait
until the full task is done; one logical unit (one flag or one cohesive change)
per commit. Must commit before next unit: before starting the next feature-flag
or logical unit, you must run git add and git commit for the current changes; do
not implement the next flag without committing the current one. Procedure for
multi-flag work: (1) implement one feature-flag unit only; (2) run git status,
git add, git commit with message per this rule; (3) only after commit succeeds,
proceed to the next unit. No batch commit at the end of the task. Session end:
no need to output a suggested commit message; commits are made during the task
at each boundary. Do not run git commit unless the user explicitly asks.

### §C. Language

Language: English only for code, comments, docstrings, UI/log strings, docs.

### §S. Comment policy (TS)

Scope: TypeScript source files (`**/*.ts`); exclude node_modules, vendor,
generated output. Keep only comments that help AI understand the file; write
them per §R and §I (language, positive phrasing, one idea per block, concrete
scope). Allow: one file-top block per file stating the module role and key
structure (e.g. keys or paths); one-line inline only for non-obvious reason or
constraint. Remove: function JSDoc and inline comments that only repeat what the
code does. Single source: detailed rules stay in this file; comments do not
duplicate them.

### §T. TypeScript symbol naming

Scope: TypeScript source files (`**/*.ts`); exclude node_modules, vendor,
generated output. Type and interface names: PascalCase. Function and method
names: camelCase. Variable and parameter names: camelCase. Zod schema constants
(e.g. export const XSchema): PascalCase. Constants for magic strings or long
literals: UPPER_SNAKE_CASE (see §P). Schema or JSON property names: use
camelCase for new domains; snake_case allowed only when required by external API
or persistence contract, and document the exception in the file or schema. Class
names: PascalCase. Enum type names: PascalCase; enum members: use one style
project-wide (UPPER_SNAKE_CASE or PascalCase). Re-exports of third-party types
or functions: keep original names. Examples and domain exceptions:
shared/prompt/documentation/reference.md (TS symbol naming).

### §D. Document and directory format

Pattern: use [prefix]-[suffix].mdc or [prefix]-[infix]-[suffix].mdc; prefix and
suffix required; infix optional. Segment form: lowercase; separate words with
one hyphen; no underscores; suffix singular (except types); descriptive,
pronounceable, searchable. Axis rule: each segment uses exactly one axis from
its allowed set (see §E); no axis pollution; one word must not appear in two
axes. The same §E sets are the approved names for that tier and below (files,
subfolders, modules, symbols). New rule files: pick one prefix from
Scope/Layer/Context; one suffix from Artifact/Policy/Meta; add infix from
Actor/Action/Entity only when the rule applies to a specific focus.

Document files under shared/prompt/: use [suffix].md only. Prefix and infix are
implied by the path (shared = prefix, prompt = infix). Suffix must be from §E
allowed sets (Artifact, Policy, Meta). Same segment form: lowercase; one hyphen
between words; no underscores. Exceptions: see §F (e.g. README.md at tree root).
Scope for document names: the segment naming rule applies to exactly one
document tree; in this project only .md files under shared/prompt/ are in scope.
Files outside that tree (e.g. root README.md, CONTRIBUTING.md, CHANGELOG.md) are
not subject to document-name rules.

Directory structure (max 3 levels; segment order): level 1: folder name from
approved prefix (required); level 2: folder name from approved infix (optional);
level 3: folder name from approved suffix (optional). Order: prefix / infix /
suffix; do not add a fourth level.

### §E. Document and directory naming

Directory tier names use prefix (level 1), infix (level 2), and suffix (level 3)
from the allowed sets below. The same allowed values for each axis are the
approved names for that tier and its subtree: use them for tier names and,
within that tier, for file names, subfolder names, module/namespace names, and
public symbol names. When the first tier is a Layer (presentation, application,
domain, infrastructure), tier 2 and tier 3 names must use only that layer's
allowed Infix and Suffix sets defined below. Mandatory scope: directory and
rule/document naming per §D and §F; other uses apply from new or renamed items
(see §J). Schema SQL files under shared/infra/schema/ follow reference.md (Schema DDL file naming).

Clean dictionary (one word per concept — overlap resolution): middleware: only
Suffix (Artifact); never Infix (use interceptor, filter). policy: only Suffix
(Policy); never Infix (use validator, guard). cache: only Infix (Entity); never
Suffix (use store, storage). config: only this spelling; never configuration.
education: only this spelling; never edu. type (TS/classification): use types in
Suffix Meta; never type. core: forbidden in Context; use shared, base, or domain
(layer). context (API): use provider in Infix Entity; do not use context as
segment. record: only Entity; stored units of data (e.g. extracted record,
identity record); one record per file or index entry.

Prefix — one axis only: [ Scope | Layer | Context ]. Rule: prefix must denote
system position only; technical tools (cache, redis) or artifact form (config,
test) must not be prefix. Axis "Context" = Bounded Context (what it is for);
Layer value "domain" = DDD domain layer only. Scope (blast radius — where impact
reaches): global, shared, system, module, component. Never prefix: app (use
system), config, file, code, architecture. Layer (stack position — where it
sits): presentation, application, domain, infrastructure. Never prefix: api, web
as layer (refine into above if needed); security, observability, compliance (use
Context instead). Context (bounded context — what it is for): business: payment,
order, auth, user, catalog, education, student, ticket, bucket, item, economy,
scout; system: security, observability, compliance. Never prefix: core (use
shared, base, or domain); cache, adapter, redis, test (use Infix/Suffix).

Infix — one axis only: [ Actor | Action | Entity ]. Rule: infix must not
duplicate Scope/Layer/Context meaning. Forbidden in Infix: middleware (use
interceptor, filter), policy (use validator, guard). Actor (architectural role
or agent): router, service, repository, entity, interceptor, filter, adapter,
facade, client, agent, worker, guard, validator. Entity (data or medium kind):
payload, stream, blob, cache, session, document, record, json, sql, redis,
prompt, provider. Action (lifecycle or operation): bootstrap, shutdown, runtime,
build, migration, recovery, read, write, batch, parse, upload, search, validate.

Suffix — one axis only: [ Artifact | Policy | Meta ]. Rule: suffix denotes form
of the deliverable; context meaning belongs in Prefix, not Suffix. Forbidden in
Suffix: cache (use store, storage), configuration (use config). Artifact
(concrete deliverable shape): schema, mapping, store, storage, event, endpoint,
response, middleware, format, exception, config, pipeline, metrics, trace,
transfer, client. Policy (principle, constraint, or policy): boundary,
constraint, contract, principle, safety, validation, compliance, isolation. Meta
(documentation, test, or classification): test, documentation, naming, style,
log, types, language, profile, assessment, reference, plan, handoff, strategy,
usage, tips, overview, goal.

Examples: payment-infra-redis-config (Context + Layer + Entity + Artifact);
security-application-guard-policy (Context + Layer + Actor + Policy);
global-config (Scope + Artifact).

Layer-specific allowed Infix and Suffix (when tier 1 is Layer): When the first
tier is one of presentation, application, domain, infrastructure, tier 2 and
tier 3 names must use only that layer's allowed sets below. Presentation —
Infix: router, facade, interceptor, filter, guard, client, validator, payload,
session, document. Suffix: endpoint, response, config, format, middleware,
exception, trace, boundary, validation. Application — Infix: service, facade,
agent, worker, guard, validator, payload, session, document, record, read,
write, batch, parse, search, validate, migration, recovery. Suffix: pipeline,
config, event, store, metrics, trace, boundary, constraint, validation,
compliance. Domain — Infix: entity, repository, service, record, document,
validate. Suffix: schema, event, boundary, constraint, contract, principle,
types. Infrastructure — Infix: adapter, client, repository, agent, worker, blob,
cache, session, record, json, sql, redis, stream, document, bootstrap, shutdown,
read, write, batch, migration, recovery, parse, upload. Suffix: store, storage,
config, mapping, pipeline, metrics, trace, log, boundary, isolation.

### §F. Directory structure and exceptions

Purpose: Apply a single rule to all directory creation except exceptions; keep
structure as prefix → infix → suffix for discoverability and maintenance.

Scope: All directories not in the exception list (root and any depth). "Level"
means directory tiers only: prefix, infix, suffix. Root is not counted as a
level; max depth is 3 tiers (prefix / infix / suffix).

Rule content — structure: Allowed forms (exactly one of three): prefix/
prefix/infix/ prefix/infix/suffix/ Order fixed: prefix then infix then suffix;
no fourth tier.

Rule content — naming: Each tier name must use only approved values for that
axis (prefix / infix / suffix); see §E. When prefix is a Layer value, infix and
suffix are restricted to that layer's allowed sets in §E. That same §E
vocabulary applies to names within that tier (files, subfolders, modules,
symbols). Lowercase; one hyphen between words; no underscores or spaces.

Exceptions: Maintain an explicit exception list; same list for docs and tooling.
Typical entries: .git, .cursor, node_modules, dist, build, coverage, vendor,
.cache, temp, tests (confirm per project). Update list and any validator
together.

Document exceptions: Maintain a separate explicit list for .md files exempt from
segment naming. Fixed names: README.md, CHANGELOG.md and similar
platform-expected names; the document-tree root index README.md may be exempt.
Under shared/prompt/, document names follow §D: [suffix].md only. Optional: one
path may be listed to keep its current name (e.g. during migration). Update this
list and any document-name validator together.

Documentation allowed names: Under shared/prompt/documentation/, the allowed
document base names ([suffix] in [suffix].md) are restricted to: reference,
usage, strategy, guide, runbook. No other segment names; new docs in this
directory must use one of these five.

Documentation: Rule text lives only in this file; .cursor/rules/*.mdc state
scope and when to apply (e.g. always vs on-request). In docs, state: scope, "max
3 tiers" (prefix/infix/suffix only; root not counted), the three allowed forms,
order, no fourth tier, naming reference, exception list.

Validation (optional): Script: walk directories from root; skip exception list;
assert remaining paths match prefix/(infix/)(suffix/) and tier names in allowed
sets; exit 1 on failure. For layer-prefixed paths, run
`deno task naming-layer-check` (shared/prompt/scripts/check-naming-layer.ts).
Run in pre-commit or CI. Document names: optionally walk the document tree (e.g.
shared/prompt/), skip document exceptions, assert each remaining .md matches
[suffix].md and suffix is in §E allowed sets (for shared/prompt/documentation/,
use the documentation allowed list only: reference, usage, strategy, guide,
runbook); run in pre-commit or CI.

Agent / tool behavior: When creating directories, use only the three allowed
forms for non-excepted paths; use only approved axis values per §E.

### §G. Dependency constraint

Dependency addition: do not add dependencies arbitrarily; only add if (a) listed
in the project official dependency list, or (b) the addition meets all mandatory
stable-library criteria below. Agent must not extend the official list without
human approval. Official list: the project maintains an official list of allowed
dependencies (deno.json imports and optionally docs); new entries require
updating that list first.

### §H. Validation policy (libraries)

Stable library — mandatory (all required): (1) release within 12 months on JSR
(or registry in use); (2) official docs URL; (3) license in allowed set below;
(4) no Critical/High CVE at add time, and dependency audit in CI when applicable
(e.g. deno audit); (5) single clear purpose (no kitchen-sink). Stable library —
recommended: (6) JSR weekly downloads ≥10k or documented exception; (7) direct
deps ≤10 or approved exception; (8) SemVer or explicit version policy; (9) no
Critical/security issues open >90 days; (10) alternative libs exist and
migration path documented. Prefer all; document exceptions. Allowed licenses
(project): permissive: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC;
copyleft compatible: GPL-3.0-or-later, AGPL-3.0-or-later, LGPL-2.1-only,
LGPL-3.0-or-later; also MPL-2.0. Not allowed: GPL-2.0-only unless explicitly
approved, proprietary, or incompatible copyleft terms.

### §I. Agent principles

Conventions: follow standard conventions (formatting, naming, structure). KISS:
prefer the simplest option; reduce complexity. Boy scout rule: leave anything
you touch cleaner than you found it. Root cause: find it; address causes, not
only symptoms. Consistency: be consistent across the project (terms, tone,
layout). Phrasing: prefer positive phrasing in docs and specs ("Do X" over "Do
not do Y"). Rule file format: one rule per block; no blank line between rules;
wrap with indent so continuation is clearly the same rule. Rule file line wrap:
break only at punctuation (;, ,) or after a complete phrase; never split a noun
phrase or parenthetical mid-phrase; meaning per line over 80 chars in rule
files. Clear rules (when adding from docs): only add to rules what satisfies all
three: (1) stateable as must/do not/only in one sentence, no prefer/recommended;
(2) concrete scope (files, symbols, or patterns named); (3) violation detectable
by static check or simple heuristic; otherwise keep in docs or as guidance only.
No speculative implementation: do not add modules, endpoints, or infrastructure
for a future phase; add only when the feature is in current scope
(shared/prompt/boundary.md).

### §J. Migration boundary

When to migrate (diagnosis): rule files that mix axes (e.g. two suffixes in one
name or one file) or use forbidden prefix/segment must be refactored; plan
first, then execute; do not rename or split without a migration plan. Plan
before execute: write a migration plan: for each current file, list target
filename(s) with axis (prefix, infix, suffix), content responsibility per new
file, and which current files will be removed; do not execute renames or splits
without this mapping. Execute order: create all new rule files with split
content first; only after that delete the old files; one logical migration (one
plan) per commit. Naming: new rule file names must follow §D and §E; use infix
from Actor/Action/Entity where it clarifies focus (e.g. document, event, agent).
No scope doc change: adding or refactoring .cursor/rules does not require
shared/prompt/boundary.md change; scope doc is for modules, API routes,
infrastructure only. Document renames: when renaming .md under the document tree
to comply with segment naming, (1) list current files and target names per
§D/§E, (2) rename (prefer non-referenced files first), (3) update in-tree
references and links, (4) verify with document-name validation if available;
detailed steps in documentation/strategy.md or store §J.

### §K. Scope document boundary

Scope document: the single source of truth for in-scope modules, API surface,
and infrastructure is shared/prompt/boundary.md; update that doc before adding.
Scope-bound implementation: do not add new modules, API routes (routers), or
infrastructure (broker, extra DB, queue, search engine) unless they are listed
in shared/prompt/boundary.md; add them to shared/prompt/boundary.md first, then
implement.

### §L. Agent and scope

Agent and scope: agent must not extend scope arbitrarily; propose scope doc
changes for human approval, then implement only after scope is updated.
Cross-domain service calls: must follow the allowed dependency matrix and remain
acyclic (see shared/prompt/documentation/reference.md, § Domain dependency);
update the matrix and check-domain-deps allowlist before adding a new
cross-domain dependency.

### §M. Root README boundary

Root README (repository root README.md): the Documentation section lists only
domain entry points; each entry links to a scope-level README (e.g.
shared/README.md), not to files under prefix/infix/suffix. Deep links: do not
add links from root README to individual docs (e.g. store.md, handoff.md,
overview.md); those live in each domain's README.

### §N. Type-check policy

Type-check policy: do not disable or bypass type checking. Do not add --no-check
(or equivalent) to any deno task or run command; do not set skipLibCheck or
disable strict mode in tsconfig; do not use // @ts-ignore or //
@ts-expect-error. Fix type errors by correcting types or code. Validation: run
deno task type-check-policy (shared/prompt/scripts/check-type-policy.ts); CI
runs this step; fail on any violation.

### §O. Answer format (options with pros and cons)

When a reply presents multiple options or alternatives, list at least one pro
and one con for each option. Keep each pro/con to one short line unless context
requires more. Omit this only when options are trivial or the user asks for no
comparison.

### §P. Format limits (code)

Formatter: use the project formatter (deno fmt, lineWidth 80); prefer Format on
Save so the machine handles line breaks (Track A) and §P is satisfied. Line
length: keep lines to 80 characters or fewer (strict); exceptions only where
documented (e.g. long URLs in comments). One effective line = 80 character units
per physical line: ceil(length/80); empty line = 0. File length: keep files to
100 effective lines or fewer (sum of effective lines over all physical lines);
split when longer. Scope: TypeScript source (e.g. `**/*.ts`); exclude
node_modules, vendor, generated output. Exception: file-length check is not
applied to test files (paths ending with `_test.ts` or under a `tests/`
directory); line-length check still applies.

Function body: block body 2–4 statements (AST direct statements in block body
only); expression body allowed (counts as 1). A single statement is allowed when
it is a try/catch, switch, or block-bodied if (complex statement exemption).
Line length in body is not enforced by this rule; use the formatter and
line-length check instead. Validation: line-length and file-length by
shared/prompt/scripts/check-line-length.ts (which applies the test-file
exception above); pre-commit and CI run this check. Function body by `deno lint`
(plugin function-length/function-length in
shared/prompt/scripts/function-length-lint-plugin.ts, counts statements in
body). To ignore per function: `// function-length-ignore` on the line above; or
`// function-length-ignore-file` at top of file. Async: when the body only
returns a promise from a helper, return the promise without
`async`/`return await` (avoids an extra microtask); outside try/catch do not use
`return await`. Guidance (not enforced): keep indentation depth to 1–2 levels.

80-character defense (Track B — architectural extraction): when line length
would otherwise exceed 80 chars or harm readability, apply these rules. Extract
types early: when a function parameter or return type is complex (generics,
nested objects), do not write it inline; extract a named `type` or `interface`
above the function and reference it in the signature; in phase-gated work
complete this in Phase 2 (interface design). Extract magic strings: when a
string literal exceeds 30 characters (error messages, headers, long regex),
extract it to a constant (UPPER_SNAKE_CASE) at file top or in a dedicated
constants module. Separate assignment and evaluation: when destructuring the
result of a complex call would exceed 80 chars, introduce an intermediate
variable or break the right-hand side across lines for clarity.

File-length conflict protocol: when keeping to the function body limit (2–4
statements) would make a file exceed 100 effective lines, do not add a
file-length exempt. Split into sibling modules in the same directory (e.g.
-helpers, -validate); keep the entry file as orchestrator only so every file
stays under 100 effective lines.

### §Q. Phase-gated feature implementation

When it applies: only when implementing a new feature (adding or changing code
for a feature). Refactor-only, docs-only, or urgent bugfix work are explicit
exceptions; §Q does not apply. Non-code tasks may use requirement summary and
approval only; design phase is "not applicable" then. Four phases: (1)
Requirement — present only a short requirement/constraint summary; do not write
code or types. (2) After explicit user approval — propose only interfaces/types
for the tree; do not write implementation or JSX. (3) After explicit user
approval — implement per approved design. (4) Add or update tests, then commit
per §B. CRITICAL RULE (AI output control): At phase 1 completion: stop
generating further text; ask the user "Do you approve this requirement summary?"
(or equivalent); do not proceed to the next phase until the user gives explicit
confirmation (e.g. Yes, Approved, Go ahead). At phase 2 completion: stop
generating; ask "Do you approve this design (interfaces/types)?" (or
equivalent); do not write implementation (logic or JSX) until explicit approval.
Approval definition: the user has approved when they indicate in chat that the
next phase may proceed (e.g. "Approve", "OK", "Proceed to next phase", "Go
ahead", "Approved"). One-line definition; agent must not advance phase without
such a response.

### §R. AI document writing principles

Scope: documents under shared/prompt/ that are consumed by AI; that is, all .md
files there except store.md and except files under shared/prompt/documentation/.
store.md is the single source for rules and follows §I and Part B format; §R
does not apply to it. Files under documentation/ are for people and tips; §R
does not apply there. Language: Use English only in those AI-facing docs (§C).
Phrasing: Prefer positive phrasing ("Do X" over "Do not do Y"); see §I.
Rule-like content: When stating a rule or constraint, use one sentence per rule;
state scope concretely (files, symbols, or patterns); make violations detectable
where possible; otherwise keep as guidance only. Structure: One idea per block;
no blank line between continuations of the same rule; wrap lines at punctuation
or phrase boundaries; do not split a noun phrase or parenthetical mid-phrase (§I
rule file format). Single source: Keep authoritative rule text only in this file
(store.md); other AI-facing docs reference store sections and do not duplicate
rule text. Naming: Use [suffix].md only under shared/prompt/; suffix from §E
allowed sets; see §D and §F. Scannability: Use clear headings and one concept
per bullet or block; state when a rule applies (scope, exceptions); include
short fixed examples where they help agents parse intent.

### §U. SQL style

Scope: SQL and DDL (e.g. shared/infra/schema/*.sql, and when suggesting
schema or DML). File naming for DDL files: shared/prompt/documentation/reference.md
(Schema DDL file naming). The rules below are Celko-derived; adopt as mandatory
or recommended per team agreement; checkable and review-friendly.

**1. Names and identifiers**

- Use only letters, digits, and underscore in names; impose a length limit (e.g. 30) and state it.
- Do not use quoted identifiers (double-quoted); improves portability and compatibility.
- Case: reserved words UPPERCASE; schema objects (tables, views) lowercase snake_case in this project; columns and variables lowercase snake_case.
- Do not use tbl_, vw_, or other table/view prefixes.
- Use standard suffixes where they apply: _id, _date, _nbr, _name, _code, _status; align with team vocabulary.
- Table and view names: plural or set nouns (e.g. actor_profile, concept_scheme).
- Aliases: derive from base table or role; do not use meaningless a, b, c.
- Relationship tables: name with domain terms (e.g. enrollments, concept_relation).
- Avoid ambiguous names: bare id, date, amount; use qualified names (e.g. user_id, created_at).
- Use the same attribute name for the same meaning across the schema; keep a naming policy or data dictionary.
- Do not expose physical locators (IDENTITY/ROWID/GUID) as logical keys.
- Avoid CamelCase in SQL; define exceptions only when necessary.

**2. Typography and spacing**

- One space between tokens.
- Commas at end of line; one space after comma.
- Use full reserved words (no AS omission; INT → INTEGER, etc.).
- Prefer standard reserved words and standard syntax; minimize non-standard extensions.
- Use vertical alignment for clauses/keywords where it improves readability.
- Indent with a fixed width (e.g. 3 spaces or team-agreed).
- Group related statements; use blank lines to separate logical steps.

**3. DDL**

- DEFAULT: place after type, before NOT NULL in column definition.
- DEFAULT value type must match column type.
- Prefer standard data types; avoid non-standard types; maintain an allowed-list if needed.
- PRIMARY KEY: declare at top of CREATE TABLE (first column or first in list).
- Column order: logical grouping and logical sequence.
- Reference constraints and ON DELETE/ON UPDATE: indent for readability.
- Give every constraint a name (CONSTRAINT name) for CHECK, UNIQUE, FK, etc.
- CHECK: one purpose per CHECK where possible; name conveys meaning.
- Every table must have a key; prefer natural or surrogate key; do not expose physical locators.
- Do not split attributes across table/column/row.
- Do not apply OO or EAV patterns in the RDBMS schema.

**4. DML and coding choices**

- OUTER JOIN: use standard ANSI (LEFT JOIN … ON, RIGHT JOIN … ON); no comma-style joins.
- Dates/times: ISO format and standard temporal syntax.
- Prefer standard, portable functions.
- Avoid unnecessary parentheses.
- Use CASE (or equivalent) for complex conditions.
- Range conditions: prefer BETWEEN unless performance requires exception; document exception.
- Equality lists: use IN().
- Comment procedures and complex queries (purpose, clause-level where helpful).
- Avoid optimizer hints unless justified; document reason and review.
- Prefer declarative referential integrity (DRI) over triggers.
- Prefer joins or non-correlated subqueries over correlated subqueries.
- Prefer OR/CASE over UNION chains on the same base table where equivalent.

**5. VIEW**

- View names: same rules as tables (plural/set noun); no vw_ prefix.
- CREATE VIEW: list column names explicitly.
- Create views only when purpose is clear.
- Do not create views unnecessarily.
- Do not use "one view per table" by default.

**6. Stored procedures and scripts**

- Use structured control (IF, LOOP, etc.); limit cyclomatic complexity (e.g. ≤10).
- Prefer subqueries, derived tables, or views over temporary tables.
- Prefer set-based operations over cursors.
- In IF branches: consolidate identical DML into one statement (e.g. CASE) where possible.
- Procedure parameters: prefer scalars; use table parameters or similar for structured input.
- Avoid dynamic SQL; if used, prevent SQL injection.

**7. Measurement and encoding (schema design)**

- Numeric types: clarify range and unit; use CHECK where appropriate.
- Use existing standard encodings (e.g. ISO) where applicable.
- Allow room for code extension in design.
- Consider explicit "missing" codes instead of NULL where it fits policy.

**Priority (rules to adopt first)**

Names: length and character set (1.1.2), no quoted identifiers (1.1.3), no prefixes (1.2.3), standard suffixes (1.2.4), no ambiguous names (1.3.1), no physical locator as logical key (1.3.3). Format: case (2.1.2–2.1.4), full reserved words (2.4), indentation (2.8). DDL: constraint names (3.7), key and natural/surrogate principle (3.13). DML: standard JOIN (6.1.1), no hints unless justified (6.4), DRI over triggers (6.5), avoid correlated subqueries (6.9). VIEW: same naming as tables (7.1), explicit column names (7.1.1). Procedures: prefer set over cursor (8.4.2), dynamic SQL and injection prevention (8.6).
