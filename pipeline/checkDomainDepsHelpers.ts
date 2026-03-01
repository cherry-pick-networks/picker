// function-length-ignore-file — CI/utility script (§P reserved).
//
// Helpers for domain dependency check. Used by checkDomainDeps.ts.
//

export const IMPORT_RE = /from\s+["']([^"']+)["']/g;

export async function* findTsFiles(
  dir: string,
): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      yield* findTsFiles(path);
    } else if (entry.name.endsWith('.ts')) {
      yield path;
    }
  }
}

export function extractImports(content: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(content)) !== null) {
    out.push(m[1]);
  }
  return out;
}

export function parseCrossDomainEdge(
  importPath: string,
  fromDomain: string,
  domains: string[],
): string | null {
  let rest: string;
  if (importPath.startsWith('#api/')) {
    rest = importPath.slice(8);
  } else if (importPath.startsWith('../')) {
    rest = importPath.slice(3);
  } else {
    return null;
  }
  const nextSlash = rest.indexOf('/');
  const toDomain = nextSlash === -1
    ? rest
    : rest.slice(0, nextSlash);
  if (
    toDomain === fromDomain || !domains.includes(toDomain)
  ) return null;
  return toDomain;
}

export function findCycle(
  edges: Map<string, string[]>,
): string[] | null {
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  const pathIndex = new Map<string, number>();
  let cycle: string[] | null = null;

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
