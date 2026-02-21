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
- Static file serving: GET `/static/*` serves files from `system/static/`
  (Hono serveStatic, root `./system`). Scope: boundary.md and ROUTES updated.
- E2E over real HTTP: `tests/system/main_e2e_test.ts` — GET /, GET /kv,
  GET /ast, GET /ast-demo, GET /scripts, GET /scripts/hello.txt,
  GET /static/e2e-smoke.txt, POST /kv, POST /ast/apply, DELETE /kv/:key,
  POST /scripts; plus load check (20 concurrent GET / within 5s). Static
  fixture: `system/static/e2e-smoke.txt`.
- **Tests under root tests/**: All tests moved to `tests/system/` (app) and
  `tests/scripts/` (function-length-lint-plugin_test.ts). `deno task test`
  discovers them automatically; no path config.
- **Scope rules split**: §K and §L moved to `.cursor/rules/system-document-boundary.mdc` and `system-agent-boundary.mdc` (store.md unchanged; global-agent-policy no longer lists §K/§L).
- **AST self-edit phase 1**: boundary.md updated with POST `/ast/apply` and system/service role (AST read/patch for shared/runtime/store/). Implemented: `system/service/ast.ts` (applyPatch: Governance + readScript + replace oldText/newText + writeScript), `system/router/ast-apply.ts` (POST /ast/apply). ROUTES and registerRoutes updated. Tests in `tests/system/main_ast_apply_test.ts` (invalid body, empty path, path escape 403, oldText not found 400, success and content updated). scope-check and `deno task test` pass.
- **Tests no longer write into shared/runtime/store**: `system/store/scripts.ts` uses `getScriptsBase()` (env `SCRIPTS_BASE` else `shared/runtime/store`). Helper `tests/system/with_temp_scripts_store.ts` runs tests with a temp dir and cleanup. `main_scripts_test.ts`, `main_ast_apply_test.ts`, and `main_e2e_test.ts` wrap script-store tests in `withTempScriptsStore`; E2E GET /scripts/hello.txt uses `seedHello: true`. No new files are left in the real store after test runs.

---

## Tried / failed

- Switched to Hono and explicit route registration (replacing prior file-based
  routing).

---

## Next steps

<!-- Bullet list; one item = one task; if none required, add at least one optional (store §9). -->

- Deferred: Spec summary (e.g. current phase in plan.md or documentation/guide); then extend patch format (e.g. ts-morph-based edits) or Thompson Sampling MAB per roadmap.
- Optional: Add more E2E or integration tests for other routes or edge cases as needed.

---

## Branch point (optional)

<!-- Commit or conversation id where this handoff branches from -->
