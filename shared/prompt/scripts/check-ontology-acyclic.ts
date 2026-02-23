/**
 * Verify concept_relation forms a DAG for relation_type = 'requires' only.
 * Exit 0 if acyclic, 1 if cycle. Task: deno task ontology-acyclic-check
 */

import { getPg } from "#shared/infra/pg.client.ts";

const SQL_REQUIRES_EDGES =
  "SELECT source_id, target_id FROM concept_relation " +
  "WHERE relation_type = 'requires'";

type Edge = { source_id: string; target_id: string };

function findCycle(edges: Edge[]): string[] | null {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const list = adj.get(e.source_id) ?? [];
    list.push(e.target_id);
    adj.set(e.source_id, list);
  }
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  const pathIndex = new Map<string, number>();

  function dfs(u: string): string[] | null {
    visited.add(u);
    stack.add(u);
    const idx = path.length;
    path.push(u);
    pathIndex.set(u, idx);
    for (const v of adj.get(u) ?? []) {
      if (!visited.has(v)) {
        const cycle = dfs(v);
        if (cycle != null) return cycle;
      } else if (stack.has(v)) {
        const start = pathIndex.get(v) ?? 0;
        return path.slice(start).concat(v);
      }
    }
    path.pop();
    pathIndex.delete(u);
    stack.delete(u);
    return null;
  }

  const nodes = new Set<string>();
  for (const e of edges) {
    nodes.add(e.source_id);
    nodes.add(e.target_id);
  }
  for (const n of nodes) {
    if (!visited.has(n)) {
      const cycle = dfs(n);
      if (cycle != null) return cycle;
    }
  }
  return null;
}

async function main(): Promise<void> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<Edge>(SQL_REQUIRES_EDGES);
  const cycle = findCycle(rows);
  if (cycle != null) {
    console.error(
      "Ontology acyclic check failed: cycle in concept_relation (requires):",
    );
    console.error(cycle.join(" -> "));
    Deno.exit(1);
  }
  console.log(
    "Ontology acyclic check passed (requires relation_type is a DAG).",
  );
}

main().catch((e) => {
  console.error("Check failed:", e);
  Deno.exit(1);
});
