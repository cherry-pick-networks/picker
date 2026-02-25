/**
 * Todo check helpers: parse todo doc, map file paths to routes,
 * extract handler methods, walk router dir. Used by check-todo.ts.
 */
// function-length-ignore-file

export type Route = { method: string; path: string };

export function parseScopeApiTable(content: string): Route[] {
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
 * Convert a file path under router (e.g. index.ts, kv/index.ts, kv/[key].ts)
 * to a route path (e.g. "/", "/kv", "/kv/:key").
 */
export function filePathToRoutePath(relativePath: string): string {
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

/** Extract HTTP methods from handler export in file content. */
export function extractMethodsFromHandler(content: string): string[] {
  const methods: string[] = [];
  const re = /handler\.\s*(GET|POST|PUT|PATCH|DELETE)\s*[\(\{]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const method = (m[1] ?? "").toUpperCase();
    if (method && !methods.includes(method)) methods.push(method);
  }
  return methods;
}

export async function walkRouterFiles(
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

export function routeKey(r: Route): string {
  return `${r.method} ${r.path}`;
}
