/**
 * Domain dependency check: fail if (1) any cross-domain imports form a cycle,
 * or (2) an import edge is not in the allowed matrix. Only domains
 * actor, content, source, script, record, kv, audit are considered (app is
 * excluded). Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-domain-deps.ts
 * Or: deno task dependency-check
 *
 * Allowlist must match shared/prompt/documentation/reference.md
 * § Domain dependency.
 */

import {
  extractImports,
  findCycle,
  findTsFiles,
  parseCrossDomainEdge,
} from "./check-domain-deps-helpers.ts";

const SYSTEM_DIR = "system";

const DOMAINS = [
  "actor",
  "concept",
  "content",
  "source",
  "script",
  "record",
  "kv",
  "queue",
  "audit",
];

/** [from, to] pairs allowed by the dependency matrix. */
const ALLOWED_EDGES: [string, string][] = [
  ["content", "actor"],
  ["content", "concept"],
  ["content", "script"],
  ["audit", "record"],
];

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
        const toDomain = parseCrossDomainEdge(imp, domain, DOMAINS);
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
      "Domain dependency violation: cross-domain edge not in allowed " +
        "matrix. Update reference.md and this script's ALLOWED_EDGES.",
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
      "Domain dependency violation: cycle detected. " +
        "Keep domain dependencies acyclic.",
    );
    console.error(`  Cycle: ${cycle.join(" → ")}`);
    Deno.exit(1);
  }

  console.log(
    "Dependency check passed: acyclic and all edges in allowed matrix.",
  );
}

main();
