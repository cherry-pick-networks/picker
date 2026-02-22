/**
 * Scope check: fail if code registers API routes not listed in the scope doc.
 * Reads route list from system/routes.ts. Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-scope.ts
 * Or: deno task scope-check
 */
// deno-lint-ignore-file function-length/function-length

import { parseScopeApiTable, routeKey } from "./check-scope-lib.ts";
import { ROUTES } from "../../../system/routes.ts";

const SCOPE_PATH = "shared/prompt/boundary.md";

async function main(): Promise<void> {
  const root = Deno.cwd();
  const scopePath = `${root}/${SCOPE_PATH}`;

  let scopeContent: string;
  try {
    scopeContent = await Deno.readTextFile(scopePath);
  } catch (e) {
    console.error(`Cannot read scope file: ${scopePath}`, e);
    Deno.exit(1);
  }

  const allowed = new Set(parseScopeApiTable(scopeContent).map(routeKey));
  if (allowed.size === 0) {
    console.error(
      "No API routes found in scope document. Check the file format.",
    );
    Deno.exit(1);
  }

  const inCode = ROUTES;
  const missingInScope = inCode.filter((r) => !allowed.has(routeKey(r)));
  if (missingInScope.length > 0) {
    console.error(
      "Routes in code not in scope doc. Add to shared/prompt/boundary.md first.",
    );
    for (const r of missingInScope) {
      console.error(`  ${r.method} ${r.path}`);
    }
    Deno.exit(1);
  }

  console.log(
    "Scope check passed: all routes are listed in the scope document.",
  );
}

main();
