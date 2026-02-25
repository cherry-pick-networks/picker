/**
 * Verify concept_relation forms a DAG for relation_type = 'requires' only.
 * Exit 0 if acyclic, 1 if cycle. Task: deno task ontology-acyclic-check
 */

import { getPg } from "#shared/infra/pg.client.ts";

const SQL_REQUIRES_EDGES =
  "SELECT source_id, target_id FROM concept_relation " +
  "WHERE relation_type = 'requires'";

type Edge = { source_id: string; target_id: string };

function buildAdj(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const list = adj.get(e.source_id) ?? [];
    list.push(e.target_id);
    adj.set(e.source_id, list);
  }
  return adj;
}

function getNodes(edges: Edge[]): Set<string> {
  const nodes = new Set<string>();
  for (const e of edges) {
    nodes.add(e.source_id);
    nodes.add(e.target_id);
  }
  return nodes;
}

type DfsState = {
  adj: Map<string, string[]>;
  visited: Set<string>;
  stack: Set<string>;
  path: string[];
  pathIndex: Map<string, number>;
};

function pushStack(u: string, s: DfsState): void {
  s.visited.add(u);
  s.stack.add(u);
  s.path.push(u);
  s.pathIndex.set(u, s.path.length - 1);
}

function popStack(u: string, s: DfsState): void {
  s.path.pop();
  s.pathIndex.delete(u);
  s.stack.delete(u);
}

function dfsStep(u: string, s: DfsState): string[] | null {
  for (const v of s.adj.get(u) ?? []) {
    if (!s.visited.has(v)) {
      pushStack(v, s);
      const cycle = dfsStep(v, s);
      if (cycle != null) return cycle;
    } else if (s.stack.has(v)) {
      const start = s.pathIndex.get(v) ?? 0;
      return s.path.slice(start).concat(v);
    }
  }
  popStack(u, s);
  return null;
}

function initState(edges: Edge[]): DfsState & { nodes: Set<string> } {
  const adj = buildAdj(edges);
  const nodes = getNodes(edges);
  return {
    adj,
    nodes,
    visited: new Set(),
    stack: new Set(),
    path: [],
    pathIndex: new Map(),
  };
}

function findCycle(edges: Edge[]): string[] | null {
  const s = initState(edges);
  for (const n of s.nodes) {
    if (!s.visited.has(n)) {
      pushStack(n, s);
      const cycle = dfsStep(n, s);
      if (cycle != null) return cycle;
    }
  }
  return null;
}

async function fetchCycle(): Promise<string[] | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<Edge>(SQL_REQUIRES_EDGES);
  return findCycle(rows);
}

function reportCycle(cycle: string[]): void {
  console.error(
    "Ontology acyclic check failed: cycle in concept_relation (requires):",
  );
  console.error(cycle.join(" -> "));
}

async function runCheck(): Promise<void> {
  const cycle = await fetchCycle();
  if (cycle != null) {
    reportCycle(cycle);
    Deno.exit(1);
  }
  console.log(
    "Ontology acyclic check passed (requires relation_type is a DAG).",
  );
}

runCheck().catch((e) => {
  console.error("Check failed:", e);
  Deno.exit(1);
});
