/**
 * Scope check: fail if code registers API routes not listed in the scope doc.
 * Discovers routes from system/router/ (file-based). Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-scope.ts
 * Or: deno task scope-check
 */

import {
  extractMethodsFromHandler,
  filePathToRoutePath,
  parseScopeApiTable,
  routeKey,
  walkRouterFiles,
} from "./check-scope-lib.ts";

const SCOPE_PATH = "shared/prompt/boundary.md";
const ROUTER_DIR = "system/router";

async function main(): Promise<void> {
  const root = Deno.cwd();
  const scopePath = `${root}/${SCOPE_PATH}`;
  const routerPath = `${root}/${ROUTER_DIR}`;

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

  let routerFiles: string[];
  try {
    routerFiles = await walkRouterFiles(routerPath, routerPath);
  } catch (e) {
    console.error(`Cannot read router dir: ${routerPath}`, e);
    Deno.exit(1);
  }

  const inCode: { method: string; path: string }[] = [];
  for (const rel of routerFiles) {
    const content = await Deno.readTextFile(`${routerPath}/${rel}`);
    const path = filePathToRoutePath(rel);
    const methods = extractMethodsFromHandler(content);
    for (const method of methods) {
      inCode.push({ method, path });
    }
  }

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
