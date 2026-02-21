# Handoff

Use this file when switching agent or starting a new session on the same task.
New sessions should attach only this file (and optionally
`shared/prompt/store.md`).

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

- Added integration-style tests in `main_test.ts` for GET `/`, GET `/kv/:key`,
  POST `/kv` (success and 400), GET `/ast`. Tests use `app.fetch(req)` and
  `@std/assert`; KV-using tests use `sanitizeResources: false` to avoid Deno KV
  leak detection.
- Added `deno task test` (runs `deno test -A --unstable-kv`) in `deno.json`.
- CI runs `deno task test` and `deno task scope-check`.
- **Hono app**: `main.ts` creates Hono app, `system/routes.ts` exports ROUTES
  and registerRoutes(app), `system/router/*.ts` export handlers (home, kv, ast,
  ast-demo, scripts). Scope-check reads ROUTES from system/routes.ts. Tests use
  `(req) => app.fetch(req)`; E2E uses `Deno.serve(..., handler)` with same
  handler. Start task runs `main.ts` directly.
- GET /kv (list keys, optional query `prefix`), POST /kv, GET/DELETE /kv/:key:
  system/store/kv.ts, system/router/kv.ts, tests in main_test.ts and
  main_kv_test.ts.
- GET /ast, GET /ast-demo: system/router/ast.ts, ast-demo.ts; tests in
  main_ast_test.ts.
- GET /scripts, GET /scripts/*, POST /scripts/*: system/store/scripts.ts,
  system/validator, system/router/scripts.ts; tests in main_scripts_test.ts and
  scripts_store_test.ts.

---

## Tried / failed

- Route consolidation via fsRoutes only: with `deno run main.ts`, fsRoutes() did
  not load from routeDir (Vite plugin only). Switched to Hono and explicit route
  registration.

---

## Next steps

<!-- Bullet list; one item = one task; if none required, add at least one optional (store §9). -->

- Optional: Add static file serving (e.g. static/) via Hono if needed.
- Optional: Add E2E or smoke test for GET /scripts and GET /ast-demo over real HTTP.

---

## Branch point (optional)

<!-- Commit or conversation id where this handoff branches from -->
