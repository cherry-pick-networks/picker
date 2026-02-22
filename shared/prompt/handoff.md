# Handoff

Use this file when switching agent or starting a new session on the same task.
New sessions should attach only this file (and optionally
`shared/prompt/store.md`).

---

## Session start (for AI)

**When**: This file is the main context for a new chat.

**Steps**:

1. Treat the first bullet under **Next steps** as the current task.
2. Output a work plan for that task first.
3. Describe how you will execute it (steps, order).
4. End with your recommended direction.
5. Then proceed or ask for confirmation.

---

## Current CI and GitHub features

CI (`.github/workflows/ci.yml`): lint, format-check, test, scope-check,
type-check-policy, deno audit; Deno cache enabled. Dependabot
(`.github/dependabot.yml`): weekly Deno updates. Scope and infrastructure:
[boundary.md](boundary.md).

---

## Goal

Add automated tests for in-scope API routes and ensure `deno task scope-check`
runs in CI so new routes cannot be added without updating the scope document.

---

## Progress

Current scope and implementation state: [boundary.md](boundary.md).

- API tests and scope-check in CI are done; E2E and script-store tests use temp
  dir; AST apply and log artifact storage implemented (see boundary for modules
  and routes).
- Rule compliance (store.md ยงP and lint): Removed `shared/prompt/scripts/` from
  lint exclude so function-length applies to scripts. Split
  `system/service/content.ts` (271 lines) into content-schema, content-parse,
  content-prompt, content-prompt-load, and content.ts (all โÿค100 lines). Fixed
  function-length violations across codebase (ignores or refactors). Scripts:
  use `// function-length-ignore` above individual functions when the body is
  naturally one statement (e.g. async generator) or many (e.g. main); no
  file-level exclude. Lint, type-check-policy, scope-check, naming-layer-check
  pass. Remaining ยงP: files
  still >100 lines (routes 135, profile 132, scripts 103, migrate-old-to-data
  205, check-naming-layer 106); optional 80-char line pass.

---

## Tried / failed

- Switched to Hono and explicit route registration (replacing prior file-based
  routing).

---

## Phase status (when ending mid-feature)

**When**: A session stops in the middle of a feature implementation (store.md
ยงQ).

**Do**: Record the current phase and where the next session should start.

**Example**: "Status: Phase 2 (Design) approved. Next session starts from Phase
3 (Implementation)." In a new session, say "Start from Phase 3" so the agent can
restore context.

**Phase flags**: See `shared/prompt/documentation/strategy.md` for [Phase
1/2/3].

---

## Next steps

<!-- Bullet list; one item = one task; if none required, add at least one optional (store ยง9). -->

- Optional: Split remaining ยงP >100-line files (system/routes.ts,
  system/actor/profile.service.ts, system/script/scripts.store.ts,
  shared/prompt/scripts/migrate-old-to-data.ts,
  shared/prompt/scripts/check-naming-layer.ts) and run 80-char line check.
- Deferred: Spec summary (e.g. current phase in goal.md or documentation/guide);
  then extend patch format (e.g. ts-morph-based edits) or Thompson Sampling MAB.
- Optional: Add more E2E or integration tests for other routes or edge cases as
  needed.

---

## Branch point (optional)

<!-- When this handoff represents a different approach from a previous attempt,
record one of: commit hash, handoff date, or prior chat.
Leave blank when continuing linearly. -->
