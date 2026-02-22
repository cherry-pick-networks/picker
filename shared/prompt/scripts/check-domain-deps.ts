/**
 * Domain dependency check: fail if (1) any cross-domain imports form a cycle,
 * or (2) an import edge is not in the allowed matrix. Only domains
 * actor, content, source, script, record, kv, audit are considered (app is
 * excluded). Run from repo root: deno run --allow-read shared/prompt/scripts/check-domain-deps.ts
 * Or: deno task dependency-check
 *
 * Allowlist must match shared/prompt/documentation/reference.md § Domain dependency.
 */

const SYSTEM_DIR = "system";

const DOMAINS = [
  "actor",
  "content",
  "source",
  "script",
  "record",
  "kv",
  "audit",
];

/** [from, to] pairs allowed by the dependency matrix. */
const ALLOWED_EDGES: [string, string][] = [
  ["content", "actor"],
  ["content", "script"],
];

const IMPORT_RE = /from\s+["']([^"']+)["']/g;

// function-length-ignore
async function* findTsFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      yield* findTsFiles(path);
    } else if (entry.name.endsWith(".ts")) {
      yield path;
    }
  }
}

function extractImports(content: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(content)) !== null) out.push(m[1]);
  return out;
}

// function-length-ignore
function parseCrossDomainEdge(
  importPath: string,
  fromDomain: string,
): string | null {
  if (!importPath.startsWith("../")) return null;
  const rest = importPath.slice(3);
  const nextSlash = rest.indexOf("/");
  const toDomain = nextSlash === -1 ? rest : rest.slice(0, nextSlash);
  if (toDomain === fromDomain || !DOMAINS.includes(toDomain)) return null;
  return toDomain;
}

// function-length-ignore
function findCycle(
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

// function-length-ignore
async function main(): Promise<void> {
  const root = Deno.cwd();
  const systemPath = `${root}/${SYSTEM_DIR}`;
  const edgeSet = new Set<string>();
  const edgeList: [string, string][] = [];

  for (const domain of DOMAINS) {
    const domainDir = `${systemPath}/${domain}`;
    try {
      await Deno.stat(domainDir);
    } catch {
      continue;
    }
    for await (const filePath of findTsFiles(domainDir)) {
      const content = await Deno.readTextFile(filePath);
      for (const imp of extractImports(content)) {
        const toDomain = parseCrossDomainEdge(imp, domain);
        if (toDomain === null) continue;
        const key = `${domain}\t${toDomain}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edgeList.push([domain, toDomain]);
        }
      }
    }
  }

  const allowedSet = new Set(
    ALLOWED_EDGES.map(([a, b]) => `${a}\t${b}`),
  );
  const disallowed: [string, string][] = edgeList.filter(
    ([a, b]) => !allowedSet.has(`${a}\t${b}`),
  );
  if (disallowed.length > 0) {
    console.error(
      "Domain dependency violation: cross-domain edge not in allowed matrix. Update reference.md and this script's ALLOWED_EDGES.",
    );
    for (const [a, b] of disallowed) {
      console.error(`  ${a} → ${b}`);
    }
    Deno.exit(1);
  }

  const graph = new Map<string, string[]>();
  for (const [a, b] of edgeList) {
    const list = graph.get(a) ?? [];
    if (!list.includes(b)) list.push(b);
    graph.set(a, list);
  }
  const cycle = findCycle(graph);
  if (cycle !== null) {
    console.error(
      "Domain dependency violation: cycle detected. Keep domain dependencies acyclic.",
    );
    console.error(`  Cycle: ${cycle.join(" → ")}`);
    Deno.exit(1);
  }

  console.log(
    "Dependency check passed: acyclic and all edges in allowed matrix.",
  );
}

main();
