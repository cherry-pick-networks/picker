/**
 * Helpers for domain dependency check. Used by check-domain-deps.ts.
 */

export const IMPORT_RE = /from\s+["']([^"']+)["']/g;

// function-length-ignore
export async function* findTsFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      yield* findTsFiles(path);
    } else if (entry.name.endsWith(".ts")) {
      yield path;
    }
  }
}

export function extractImports(content: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(content)) !== null) out.push(m[1]);
  return out;
}

// function-length-ignore
export function parseCrossDomainEdge(
  importPath: string,
  fromDomain: string,
  domains: string[],
): string | null {
  if (!importPath.startsWith("../")) return null;
  const rest = importPath.slice(3);
  const nextSlash = rest.indexOf("/");
  const toDomain = nextSlash === -1 ? rest : rest.slice(0, nextSlash);
  if (toDomain === fromDomain || !domains.includes(toDomain)) return null;
  return toDomain;
}

// function-length-ignore
export function findCycle(
  edges: Map<string, string[]>,
): string[] | null {
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  const pathIndex = new Map<string, number>();
  let cycle: string[] | null = null;

  // function-length-ignore
  function visit(u: string): boolean {
    if (stack.has(u)) {
      const start = pathIndex.get(u) ?? 0;
      cycle = path.slice(start);
      cycle.push(u);
      return true;
    }
    if (visited.has(u)) return false;
    visited.add(u);
    stack.add(u);
    pathIndex.set(u, path.length);
    path.push(u);
    for (const v of edges.get(u) ?? []) {
      if (visit(v)) return true;
    }
    path.pop();
    pathIndex.delete(u);
    stack.delete(u);
    return false;
  }

  for (const u of edges.keys()) {
    if (!visited.has(u) && visit(u)) return cycle;
  }
  return null;
}
