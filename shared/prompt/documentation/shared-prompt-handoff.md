# Handoff

Use this file when switching agent or starting a new session on the same task.
New sessions should attach only this file (and optionally
`shared/prompt/store/shared-prompt-store.md`).

---

## Current CI and GitHub features

CI (`.github/workflows/ci.yml`): lint, format-check, test, scope-check,
type-check-policy, deno audit; Deno cache enabled. Dependabot
(`.github/dependabot.yml`): weekly Deno updates. Full roadmap:
[shared-prompt-github-features-plan.md](shared-prompt-github-features-plan.md).

---

## Goal

Add automated tests for in-scope API routes and ensure `deno task scope-check`
runs in CI so new routes cannot be added without updating the scope document.

---

## Progress

- Added integration-style tests in `main_test.ts` for GET `/`, GET `/kv/:key`,
  POST `/kv` (success and 400), GET `/ast`. Tests use `app.handler()` and
  `@std/assert`; KV-using tests use `sanitizeResources: false` to avoid Deno KV
  leak detection.
- Added `deno task test` (runs `deno test -A --unstable-kv`) in `deno.json`.
- CI (`.github/workflows/ci.yml`) runs `deno task test` and
  `deno task scope-check`.
- Fixed FreshConfig type: `new App({ root: import.meta.url })` → `new App()` in
  `main.ts`; test task no longer uses `--no-check`.
- Documentation alignment: stack wording updated from "Hono (HTTP)" to "Fresh
  (HTTP)" and "Hono app" to "Fresh app" in `shared-prompt-store.md`,
  `shared-prompt-profile.md`; scope boundary main.ts row clarified (fsRoutes
  from system/router when using Vite).
- Route consolidation: API logic lives only in `system/router/`; `main.ts` only
  delegates (imports handler from each route file and registers path). No inline
  route logic in `main.ts`. `check-scope.ts` now discovers routes from
  `system/router/` (walk files, map path to Fresh route pattern, infer methods
  from `handler.GET`/`handler.POST`).
- E2E test for POST /kv: added in `main_test.ts` — starts real HTTP server with
  `Deno.serve(..., app.handler())` on port 0, fetches POST /kv then GET
  /kv/:key, then shuts down server.
- GET /kv (list keys, optional query `prefix`): scope doc updated, then
  `listKeys()` in `system/store/kv.ts`, `handler.GET` in `system/router/kv/index.ts`,
  registration in `main.ts`, tests in `main_test.ts`.
- DELETE /kv/:key: scope doc updated, then `deleteKey()` in `system/store/kv.ts`,
  `handler.DELETE` in `system/router/kv/[key].ts`, registration in `main.ts`, test
  in `main_test.ts` (204 and key gone).

---

## Tried / failed

- Route consolidation via fsRoutes only: with `deno run main.ts`, Fresh's
  `fsRoutes()` does not load from `routeDir` (Vite plugin only). So
  consolidation was done via delegation from `main.ts` to `system/router`
  handlers instead.

---

## Next steps

<!-- Bullet list; one item = one task; if none required, add at least one optional (store §9). -->

- Optional: Add AST demo page (e.g. /ast-demo or /demo/ast) that uses GET /ast
  API; update scope doc first, then implement.

---

## Branch point (optional)

<!-- Commit or conversation id where this handoff branches from -->
