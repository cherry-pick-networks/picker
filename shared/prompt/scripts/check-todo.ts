/**
 * Todo check: fail if code registers API routes not listed in the todo doc.
 * Reads route list from system/routes.ts. Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-todo.ts
 * Or: deno task todo-check
 */
import { parseScopeApiTable, routeKey } from "./check-todo-lib.ts";
import { ROUTES } from "#system/routes.ts";

const TODO_PATH = "shared/prompt/todo.md";

async function loadAllowedRoutes(todoPath: string): Promise<Set<string>> {
  const todoContent = await Deno.readTextFile(todoPath);
  const routes = parseScopeApiTable(todoContent).map(routeKey);
  return new Set(routes);
}

async function runTodoCheck(todoPath: string): Promise<{
  allowed: Set<string>;
  missing: typeof ROUTES;
}> {
  const allowed = await loadAllowedRoutes(todoPath);
  const missing = ROUTES.filter((r) => !allowed.has(routeKey(r)));
  return { allowed, missing };
}

function reportIfFailed(result: {
  allowed: Set<string>;
  missing: typeof ROUTES;
}): void {
  if (result.allowed.size === 0) {
    console.error(
      "No API routes found in todo document. Check the file format.",
    );
    Deno.exit(1);
  }
  if (result.missing.length > 0) {
    console.error(
      "Routes in code not in todo doc. Add to todo.md first.",
    );
    for (const r of result.missing) console.error(`  ${r.method} ${r.path}`);
    Deno.exit(1);
  }
}

async function main(): Promise<void> {
  const todoPath = `${Deno.cwd()}/${TODO_PATH}`;
  try {
    const result = await runTodoCheck(todoPath);
    reportIfFailed(result);
  } catch (e) {
    console.error(`Cannot read todo file: ${todoPath}`, e);
    Deno.exit(1);
  }
  console.log(
    "Todo check passed: all routes are listed in the todo document.",
  );
}

main();
