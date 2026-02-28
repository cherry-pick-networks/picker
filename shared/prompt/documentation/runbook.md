---
title: runbook
description: Operational runbooks; file length and split procedure.
---

# Runbooks

Operational procedures referenced from store.md. This file contains the File
length and split runbook.

---

## File length and split

**Purpose**: Keep TypeScript source files within 100 effective lines (hard cap)
and define when and how to split files, both before writing (preemptive) and
after a file exceeds the limit (reactive). Rule source: store.md §P; this
runbook is an operational summary for agents and humans.

**Scope**: TypeScript source (`**/*.ts`); exclude node_modules, vendor, generated
output. File-length rule does not apply to test files (paths ending with
`_test.ts` or under `tests/`); line-length (100 chars) still applies.
Exceptions only via shared/prompt/scripts/check-line-length-config.ts; do not
add file-length exemptions to avoid splitting.

### 1. Hard cap and effective lines

- **File length**: Each file must have ≤ 100 effective lines. Effective
  lines = sum over all physical lines of ceil(line length / 100); empty line = 0.
- **Line length**: Each line must be ≤ 100 characters (strict). Use formatter
  and line-length check; no per-line exemptions.
- **Enforcement**: shared/prompt/scripts/check-line-length.ts; run via
  `deno task format-check` / pre-commit / CI.

### 2. Preemptive split (before or while writing)

Apply so that new code is written in already-split files.

**When to use multiple files from the start**

- More than one use case or operation in the feature → one file per
  use case/operation (e.g. create vs list).
- Types/constants and behavior in one module → one file for types (and small
  pure helpers), one or more for behavior (services, handlers, adapters).
- Public surface would have more than 3–5 exports (or 1 default + 3+ named) →
  plan sibling modules so each file has one clear responsibility and a small
  set of exports.
- Code spans layers (e.g. endpoint vs service vs store) → one file per layer
  artifact.

**How to design file layout**

- Each file must have a single responsibility nameable in one phrase (e.g.
  "validate request body", "identity store").
- File names must follow §E (camelCase/PascalCase, infix/suffix) and reflect
  that responsibility; do not use generic names (e.g. utils.ts, helpers.ts).
- Put in the same file only symbols used together by the same caller or
  belonging to the same domain; otherwise prefer separate files from the start.
- Aim under 100 effective lines when adding a file; if the planned content
  would clearly exceed that, split before writing (e.g. one file per
  sub-operation or per group of related helpers).

**Design-phase checklist (before implementation)**

- Does this feature have more than one use case/operation? → Yes → one file per
  use case/operation.
- Would the module mix types/constants and behavior? → Yes → separate type
  file(s) and behavior file(s).
- Would the module have more than 3–5 public exports? → Yes → plan sibling
  modules by responsibility.
- Would the module mix layers (e.g. endpoint + service)? → Yes → one file per
  layer.
- Can this file be described in one short phrase? → No → split by
  responsibility before writing.

### 3. Reactive split (when a file exceeds 100 effective lines)

**Split by cohesion**

- Extract sibling modules (same directory or one level under, per §D/§E).
- Each new file must contain only symbols that share the same responsibility
  (e.g. one use case, one adapter, one set of types + helpers).
- Do not split into one-function-per-file; keep related functions (same domain
  or same caller) in the same file while staying under 100 effective lines.

**One public surface per file**

- Each resulting file must have a single clear public surface: one default
  export or a small set of named exports used by the same caller.
- Do not create many tiny files that each export one function unless that
  function is the only export and the file name matches it per §E.

**Naming and barrels**

- New file names must follow §E and reflect the extracted responsibility (e.g.
  validateRequest.ts, formatResponse.ts).
- Add an index.ts (or existing barrel) only when callers import more than one
  of the split modules; do not add a barrel that only re-exports a single file.

**Exceptions**

- Do not add file-length exemptions to avoid splitting; split into sibling
  modules instead.
- File-length exceptions are only in check-line-length-config.ts, with a
  documented reason (e.g. ported algorithm where splitting is not feasible).

### 4. References and commands

- **Rule source**: store.md §P (format limits, line length, file length,
  function body, AI code-writing workflow).
- **Naming and structure**: §D, §E (directory and file naming, segment names).
- **Line/file-length check**: shared/prompt/scripts/check-line-length.ts;
  config: shared/prompt/scripts/check-line-length-config.ts.
- **Commands**: `deno fmt`, `deno task format-check` (or
  `deno task line-length-check`); for applicable §: `deno task rules:summary
  -- feature` or `-- refactor`.

### 5. Summary table

| Situation | Action |
|-----------|--------|
| Designing new feature | Use preemptive criteria (§2): multiple use cases → multiple files; |
| | types vs behavior → separate files; many exports or multiple layers → |
| | sibling modules; each file one phrase, aim <100 effective lines. |
| Adding to existing file | If adding would push file over 100 effective lines, split by cohesion |
| | (§3) into sibling modules; one responsibility per file; name per §E; |
| | barrel only if multiple modules are imported together. |
| File already >100 lines | Apply reactive split (§3): by responsibility, one surface per file, |
| | no one-fn-per-file; name per §E; barrel only if multiple modules used. |
| Exception needed | Add only in check-line-length-config.ts with a comment; do not use |
| | exemption to avoid splitting. |
