/**
 * Scope check: fail if code registers API routes not listed in the scope document.
 * Run from repo root: deno run shared/prompt/scripts/check-scope.ts
 * Or: deno task scope-check
 */

const SCOPE_PATH = "shared/prompt/documentation/shared-prompt-boundary.md";
const SOURCE_FILES = ["main.ts"];

type Route = { method: string; path: string };

function parseScopeApiTable(content: string): Route[] {
  const routes: Route[] = [];
  const lines = content.split(/\r?\n/);
  let inTable = false;

  for (const line of lines) {
    if (line.startsWith("## API surface")) {
      inTable = true;
      continue;
    }
    if (inTable && line.startsWith("## ")) {
      break;
    }
    if (!inTable || !line.startsWith("|")) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 3) continue;
    const method = (cells[1] ?? "").toUpperCase();
    const path = (cells[2] ?? "").replace(/^`|`$/g, "").trim();
    if (
      /^[-]+$/.test(method) || !/^(GET|POST|PUT|PATCH|DELETE)$/.test(method)
    ) {
      continue; // separator or invalid
    }
    if (method && path) routes.push({ method, path });
  }

  return routes;
}

function extractRoutesFromSource(content: string): Route[] {
  const routes: Route[] = [];
  // app.get("/path", ...) or app.post('path', ...)
  const re = /app\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    routes.push({
      method: (m[1] ?? "").toUpperCase(),
      path: (m[2] ?? "").trim(),
    });
  }
  return routes;
}

function routeKey(r: Route): string {
  return `${r.method} ${r.path}`;
}

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

  const inCode: Route[] = [];
  for (const rel of SOURCE_FILES) {
    const path = `${root}/${rel}`;
    try {
      const content = await Deno.readTextFile(path);
      inCode.push(...extractRoutesFromSource(content));
    } catch {
      // file may not exist in some check contexts
      continue;
    }
  }

  const missingInScope = inCode.filter((r) => !allowed.has(routeKey(r)));
  if (missingInScope.length > 0) {
    console.error(
      "The following routes are in code but not listed in the scope document. Add them to shared/prompt/documentation/shared-prompt-boundary.md first, then implement.",
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
