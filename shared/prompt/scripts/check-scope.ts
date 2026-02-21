/**
 * Scope check: fail if code registers API routes not listed in the scope document.
 * Discovers routes from system/router/ (file-based). Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-scope.ts
 * Or: deno task scope-check
 */

const SCOPE_PATH = "shared/prompt/documentation/shared-prompt-boundary.md";
const ROUTER_DIR = "system/router";

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

/**
 * Convert a file path under router (e.g. "index.ts", "kv/index.ts", "kv/[key].ts")
 * to a Fresh route path (e.g. "/", "/kv", "/kv/:key").
 */
function filePathToRoutePath(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.tsx?$/, "");
  const segments = withoutExt.split("/").filter(Boolean);
  const routeSegments = segments.map((seg) => {
    if (seg === "index") return "";
    const dynamic = seg.match(/^\[\.\.\.([^\]]+)\]$/);
    if (dynamic) return `:${dynamic[1]}*`;
    const optional = seg.match(/^\[\[([^\]]+)\]\]$/);
    if (optional) return `{/:${optional[1]}}?`;
    const single = seg.match(/^\[([^\]]+)\]$/);
    if (single) return `:${single[1]}`;
    return seg;
  });
  const path = "/" + routeSegments.filter(Boolean).join("/");
  return path === "/" ? path : path.replace(/\/$/, "") || "/";
}

/**
 * Extract HTTP methods from handler export in file content (handler.GET, handler.POST, ...).
 */
function extractMethodsFromHandler(content: string): string[] {
  const methods: string[] = [];
  const re = /handler\.\s*(GET|POST|PUT|PATCH|DELETE)\s*[\(\{]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const method = (m[1] ?? "").toUpperCase();
    if (method && !methods.includes(method)) methods.push(method);
  }
  return methods;
}

async function walkRouterFiles(
  root: string,
  dir: string,
  files: string[] = [],
): Promise<string[]> {
  for await (const e of Deno.readDir(dir)) {
    const full = `${dir}/${e.name}`;
    const rel = full.slice(root.length + 1);
    if (e.isDirectory) {
      if (e.name.startsWith("_") || e.name === "node_modules") continue;
      await walkRouterFiles(root, full, files);
    } else if (
      e.isFile &&
      (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) &&
      !e.name.startsWith("_")
    ) {
      files.push(rel);
    }
  }
  return files;
}

function routeKey(r: Route): string {
  return `${r.method} ${r.path}`;
}

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

  const inCode: Route[] = [];
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
