/**
 * Scope check: fail if code registers API routes not listed in the scope doc.
 * Reads route list from system/routes.ts. Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-scope.ts
 * Or: deno task scope-check
 */
import { parseScopeApiTable, routeKey } from "./check-scope-lib.ts";
import { ROUTES } from "#system/routes.ts";

const SCOPE_PATH = "shared/prompt/boundary.md";

async function loadAllowedRoutes(scopePath: string): Promise<Set<string>> {
  const scopeContent = await Deno.readTextFile(scopePath);
  const routes = parseScopeApiTable(scopeContent).map(routeKey);
  return new Set(routes);
}

async function runScopeCheck(scopePath: string): Promise<{
  allowed: Set<string>;
  missing: typeof ROUTES;
}> {
  const allowed = await loadAllowedRoutes(scopePath);
  const missing = ROUTES.filter((r) => !allowed.has(routeKey(r)));
  return { allowed, missing };
}

function reportIfFailed(result: {
  allowed: Set<string>;
  missing: typeof ROUTES;
}): void {
  if (result.allowed.size === 0) {
    console.error(
      "No API routes found in scope document. Check the file format.",
    );
    Deno.exit(1);
  }
  if (result.missing.length > 0) {
    console.error(
      "Routes in code not in scope doc. Add to boundary.md first.",
    );
    for (const r of result.missing) console.error(`  ${r.method} ${r.path}`);
    Deno.exit(1);
  }
}

async function main(): Promise<void> {
  const scopePath = `${Deno.cwd()}/${SCOPE_PATH}`;
  try {
    const result = await runScopeCheck(scopePath);
    reportIfFailed(result);
  } catch (e) {
    console.error(`Cannot read scope file: ${scopePath}`, e);
    Deno.exit(1);
  }
  console.log(
    "Scope check passed: all routes are listed in the scope document.",
  );
}

main();
