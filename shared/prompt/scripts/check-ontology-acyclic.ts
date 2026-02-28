// function-length-ignore-file — CI/utility script; cycle detection
// needs longer bodies.
/**
 * Ontology DAG check: fail if concept_relation has a cycle when restricted to
 * relation_type = 'requires'. Run from repo root (Postgres required):
 *   deno run -A shared/prompt/scripts/check-ontology-acyclic.ts
 * Or: deno task ontology-acyclic-check
 *
 * See shared/prompt/boundary.md: DAG checks strictly enforced for
 * relation_type = 'requires' only.
 */

import { getPg } from "#shared/infra/pgClient.ts";
import { loadSql } from "#shared/infra/sqlLoader.ts";

const REQUIRES = "requires";

const sqlDir = new URL("./sql/", import.meta.url);
const EDGES_QUERY = await loadSql(sqlDir, "edges_concept_relation.sql");

function nodeKey(scheme: string, code: string): string {
  return `${scheme}:${code}`;
}

function findCycle(
  edges: {
    from_scheme: string;
    from_code: string;
    to_scheme: string;
    to_code: string;
  }[],
): string | null {
  const out = new Map<string, string[]>();
  for (const e of edges) {
    const k = nodeKey(e.from_scheme, e.from_code);
    const v = nodeKey(e.to_scheme, e.to_code);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(v);
  }
  const visited = new Set<string>();
  const stack = new Set<string>();
  let cycleStart: string | null = null;
  function visit(u: string): boolean {
    if (stack.has(u)) {
      cycleStart = u;
      return true;
    }
    if (visited.has(u)) return false;
    visited.add(u);
    stack.add(u);
    for (const v of out.get(u) ?? []) {
      if (visit(v)) return true;
    }
    stack.delete(u);
    return false;
  }
  for (const u of out.keys()) {
    if (visit(u)) return cycleStart;
  }
  return null;
}

async function main(): Promise<void> {
  const pg = await getPg();
  const r = await pg.queryObject<{
    from_scheme: string;
    from_code: string;
    to_scheme: string;
    to_code: string;
  }>(EDGES_QUERY, [REQUIRES]);
  await pg.end();
  const cycle = findCycle(r.rows);
  if (cycle !== null) {
    console.error(
      `Ontology cycle detected (relation_type = '${REQUIRES}'): ` +
        `concept ${cycle} is in a cycle.`,
    );
    Deno.exit(1);
  }
  console.log(
    "Ontology DAG check passed: no cycle in 'requires' relation.",
  );
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
