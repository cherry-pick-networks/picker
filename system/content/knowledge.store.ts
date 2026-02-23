/**
 * Knowledge graph store. Nodes and edges in PostgreSQL (knowledge_node,
 * knowledge_edge); interface: getNode/putNode/listNodes, getEdge/putEdge/listEdges.
 */

import { getPg } from "#shared/infra/pg.client.ts";
import type { KnowledgeEdge, KnowledgeNode } from "./knowledge.schema.ts";
import { selectEdges, selectNodes } from "./knowledge-store.helpers.ts";
import { nowIso } from "./content-parse.service.ts";

const SQL_NODE_GET =
  "SELECT id, type, payload, created_at FROM knowledge_node WHERE id = $1";
const SQL_NODE_UPSERT =
  "INSERT INTO knowledge_node (id, type, payload, created_at) " +
  "VALUES ($1, $2, $3, $4) " +
  "ON CONFLICT (id) DO UPDATE SET type = EXCLUDED.type, " +
  "payload = EXCLUDED.payload, created_at = COALESCE(knowledge_node.created_at, EXCLUDED.created_at)";
const SQL_EDGE_GET =
  "SELECT from_id, to_id, type, payload, created_at FROM knowledge_edge " +
  "WHERE from_id = $1 AND to_id = $2 AND type = $3";
const SQL_EDGE_GET_ANY =
  "SELECT from_id, to_id, type, payload, created_at FROM knowledge_edge " +
  "WHERE from_id = $1 AND to_id = $2 ORDER BY type LIMIT 1";
const SQL_EDGE_UPSERT =
  "INSERT INTO knowledge_edge (from_id, to_id, type, payload, created_at) " +
  "VALUES ($1, $2, $3, $4, $5) " +
  "ON CONFLICT (from_id, to_id, type) DO UPDATE SET payload = EXCLUDED.payload, " +
  "created_at = COALESCE(knowledge_edge.created_at, EXCLUDED.created_at)";

function nodeToRow(node: KnowledgeNode): [string, string | null, string, string] {
  const id = node.id;
  const type = node.type ?? null;
  const payload = JSON.stringify(node.payload ?? {});
  const created_at = node.created_at ?? nowIso();
  return [id, type, payload, created_at];
}

function edgeToRow(
  edge: KnowledgeEdge,
): [string, string, string, string, string] {
  const created_at = edge.created_at ?? nowIso();
  return [
    edge.from_id,
    edge.to_id,
    edge.type,
    JSON.stringify(edge.payload ?? {}),
    created_at,
  ];
}

export async function getNode(id: string): Promise<KnowledgeNode | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{
    id: string;
    type: string | null;
    payload: unknown;
    created_at: string | null;
  }>(SQL_NODE_GET, [id]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    type: r.type ?? undefined,
    payload: (r.payload as Record<string, unknown>) ?? undefined,
    created_at: r.created_at ?? undefined,
  };
}

export async function putNode(node: KnowledgeNode): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_NODE_UPSERT, nodeToRow(node));
}

export async function listNodes(
  opts?: { type?: string; limit?: number },
): Promise<KnowledgeNode[]> {
  const sql = await getPg();
  const rows = await selectNodes(sql, opts ?? {});
  return rows.map((r) => ({
    id: r.id,
    type: r.type ?? undefined,
    payload: (r.payload as Record<string, unknown>) ?? undefined,
    created_at: r.created_at ?? undefined,
  }));
}

export async function getEdge(
  fromId: string,
  toId: string,
  type?: string,
): Promise<KnowledgeEdge | null> {
  const sql = await getPg();
  if (type != null) {
    const { rows } = await sql.queryObject<{
      from_id: string;
      to_id: string;
      type: string;
      payload: unknown;
      created_at: string | null;
    }>(SQL_EDGE_GET, [fromId, toId, type]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      from_id: r.from_id,
      to_id: r.to_id,
      type: r.type,
      payload: (r.payload as Record<string, unknown>) ?? undefined,
      created_at: r.created_at ?? undefined,
    };
  }
  const { rows } = await sql.queryObject<{
    from_id: string;
    to_id: string;
    type: string;
    payload: unknown;
    created_at: string | null;
  }>(SQL_EDGE_GET_ANY, [fromId, toId]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    from_id: r.from_id,
    to_id: r.to_id,
    type: r.type,
    payload: (r.payload as Record<string, unknown>) ?? undefined,
    created_at: r.created_at ?? undefined,
  };
}

export async function putEdge(edge: KnowledgeEdge): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_EDGE_UPSERT, edgeToRow(edge));
}

export async function listEdges(opts?: {
  fromId?: string;
  toId?: string;
  type?: string;
}): Promise<KnowledgeEdge[]> {
  const sql = await getPg();
  const rows = await selectEdges(sql, opts ?? {});
  return rows.map((r) => ({
    from_id: r.from_id,
    to_id: r.to_id,
    type: r.type,
    payload: (r.payload as Record<string, unknown>) ?? undefined,
    created_at: r.created_at ?? undefined,
  }));
}
