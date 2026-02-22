# Handoff

Use this file when switching agent or starting a new session on the same task.
New sessions should attach only this file (and optionally
`shared/prompt/store.md`).

---

## Session start (for AI)

When this file is the main context for a new chat:

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
  dir; AST apply and log artifact storage implemented (see boundary for
  modules and routes).

---

## Tried / failed

- Switched to Hono and explicit route registration (replacing prior file-based
  routing).

---

## Phase status (when ending mid-feature)

When a session stops in the middle of a **feature implementation** (store.md
§Q): record the **current phase** and where the next session should start.
Example: "Status: Phase 2 (Design) approved. Next session starts from Phase 3
(Implementation)." Then in a new session you can say "Start from Phase 3" and
the agent can restore context. See strategy.md for phase flags [Phase 1/2/3].

---

## Next steps

<!-- Bullet list; one item = one task; if none required, add at least one optional (store §9). -->

- Deferred: Spec summary (e.g. current phase in goal.md or documentation/guide); then extend patch format (e.g. ts-morph-based edits) or Thompson Sampling MAB.
- Optional: Add more E2E or integration tests for other routes or edge cases as needed.

---

## Branch point (optional)

<!-- When this handoff represents a different approach from a previous attempt,
record one of: commit hash, handoff date, or prior chat.
Leave blank when continuing linearly. -->
