# Conventions and rules (human-readable)

Rules that can be checked or defined as "this repo has X".  
**Canonical source**: `shared/prompt/store/context.md` Part B.  
`.cursor/rules/*.mdc` only define **when** to apply; they do not duplicate this text.

---

## §A. Commit message format

- **Pattern**: `<type>[(scope)]: <description>`; type and description required; scope optional.
- **Types**: feat, fix, docs, chore, refactor, perf, test, ci, build. Use BREAKING CHANGE in footer or `type!` for MAJOR.
- **Description**: Imperative, lowercase after colon; optional body after blank line.
- **Check**: Commit message matches the pattern; type is from the allowed list.

Example: `feat(module): add handler`

---

## §B. Commit and session boundary

- Commit at each feature-flag (or logical unit) boundary; do not batch commits at the end.
- Before starting the next unit, run `git add` and `git commit` for the current changes.
- **Check**: Commits exist at boundaries; no large uncommitted work spanning multiple flags.

---

## §C. Language

- English only for code, comments, docstrings, UI/log strings, and docs.
- **Check**: No non-English in those artifacts (or documented exceptions).

---

## §D. Document and directory format

- **Rule files**: Name as `[prefix]-[suffix].mdc` or `[prefix]-[infix]-[suffix].mdc`; lowercase, one hyphen between words.
- **Directories**: Max 3 tiers from root (prefix → infix → suffix). Allowed forms: `prefix/`, `prefix/infix/`, `prefix/infix/suffix/`.
- **Check**: New directories (except exception list) match the three forms; rule file names follow the pattern.

---

## §E. Document and directory naming

- Each segment uses one axis only: Prefix (Scope / Layer / Context), Infix (Actor / Action / Entity), Suffix (Artifact / Policy / Meta).
- Use the clean dictionary (e.g. config not configuration; cache only as Infix; core forbidden in Context). See context.md §E for full lists.
- **Check**: Segment names come from the approved sets; no forbidden or duplicate-axis usage.

---

## §F. Directory structure and exceptions

- All non-excepted directories must follow prefix / infix / suffix order; no fourth tier.
- **Exceptions**: .git, .cursor, node_modules, dist, build, coverage, vendor, .cache (confirm per project).
- **Check**: Directory walk (excluding exceptions) validates structure and naming; optional pre-commit or CI script.

---

## §G. Dependency constraint

- Do not add dependencies unless (a) on the project official list (e.g. deno.json), or (b) the addition meets stable-library criteria and is approved.
- **Check**: New deps appear in the official list or in an approved change; no unlisted imports.

---

## §H. Validation policy (libraries)

- New libraries must satisfy mandatory criteria: recent release, docs URL, allowed license, no Critical/High CVE, single clear purpose. CI audit when applicable.
- **Check**: Dependency audit in CI; new deps documented with license and source.

---

## §I. Agent principles (summary)

- Follow conventions; prefer simplest option (KISS); leave code cleaner; fix root cause; be consistent; positive phrasing in docs.
- **Rules vs guidance**: Add to rules only what is (1) stateable as must/do not/only, (2) concrete in scope, (3) detectable; otherwise keep in docs or reference.
- No speculative implementation; scope is in docs/scope.md.

---

## §J. Migration boundary

- Refactor rule files that mix axes or use forbidden segments; write a migration plan first (target names, content per file, files to remove).
- Create new files first, then delete old; one migration per commit. Scope doc unchanged for rule-only refactors.

---

## §K. Scope document boundary

- **Single source**: docs/scope.md for in-scope modules, API surface, infrastructure.
- Do not add new modules, API routes, or infrastructure unless listed there; update docs/scope.md first, then implement.
- **Check**: New routes/modules/infra have a corresponding scope doc update.

---

## §L. Agent and scope

- Agent must not extend scope arbitrarily; propose scope doc changes for approval, then implement after update.
