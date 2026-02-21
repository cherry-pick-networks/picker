# Handoff

Use this file when switching agent or starting a new session on the same task.
New sessions should attach only this file (and optionally
`shared/prompt/store/shared-prompt-store.md`).

---

## Goal

Add automated tests for in-scope API routes and ensure `deno task scope-check` runs in CI so new routes cannot be added without updating the scope document.

---

## Progress

- Added integration-style tests in `main_test.ts` for GET `/`, GET `/kv/:key`, POST `/kv` (success and 400), GET `/ast`. Tests use `app.handler()` and `@std/assert`; KV-using tests use `sanitizeResources: false` to avoid Deno KV leak detection.
- Added `deno task test` (runs `deno test -A --unstable-kv`) in `deno.json`.
- CI (`.github/workflows/ci.yml`) runs `deno task test` and `deno task scope-check`.
- Fixed FreshConfig type: `new App({ root: import.meta.url })` → `new App()` in `main.ts`; test task no longer uses `--no-check`.

---

## Tried / failed

- None.

---

## Next steps

- Optional: route consolidation (serve API from `system/router` only) or documentation alignment (e.g. profile stack wording).

---

## Branch point (optional)

<!-- Commit or conversation id where this handoff branches from -->
