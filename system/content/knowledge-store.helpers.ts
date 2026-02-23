/**
 * Knowledge store query helpers. SELECTs for listNodes/listEdges with optional
 * filters; used by knowledge.store.ts.
 */

import type { Sql } from "#shared/infra/pg.types.ts";

const SQL_NODES_BASE = "SELECT id, type, payload, created_at FROM knowledge_node";
const SQL_EDGES_BASE =
  "SELECT from_id, to_id, type, payload, created_at FROM knowledge_edge";

export async function selectNodes(
  sql: Sql,
  opts: { type?: string; limit?: number },
): Promise<{ id: string; type: string | null; payload: unknown; created_at: string | null }[]> {
  const parts: string[] = [];
  const args: unknown[] = [];
  let i = 0;
  if (opts.type != null) {
    i++;
    parts.push(`type = $${i}`);
    args.push(opts.type);
  }
  const where = parts.length ? " WHERE " + parts.join(" AND ") : "";
  const order = " ORDER BY created_at DESC NULLS LAST";
  if (opts.limit != null) {
    i++;
    args.push(opts.limit);
  }
  const limitClause = opts.limit != null ? ` LIMIT $${i}` : "";
  const { rows } = await sql.queryObject<{
    id: string;
    type: string | null;
    payload: unknown;
    created_at: string | null;
  }>(SQL_NODES_BASE + where + order + limitClause, args);
  return rows;
}

export async function selectEdges(
  sql: Sql,
  opts: { fromId?: string; toId?: string; type?: string },
): Promise<{
  from_id: string;
  to_id: string;
  type: string;
  payload: unknown;
  created_at: string | null;
}[]> {
  const parts: string[] = [];
  const args: unknown[] = [];
  let i = 0;
  if (opts.fromId != null) {
    i++;
    parts.push(`from_id = $${i}`);
    args.push(opts.fromId);
  }
  if (opts.toId != null) {
    i++;
    parts.push(`to_id = $${i}`);
    args.push(opts.toId);
  }
  if (opts.type != null) {
    i++;
    parts.push(`type = $${i}`);
    args.push(opts.type);
  }
  const where = parts.length ? " WHERE " + parts.join(" AND ") : "";
  const order = " ORDER BY created_at DESC NULLS LAST";
  const { rows } = await sql.queryObject<{
    from_id: string;
    to_id: string;
    type: string;
    payload: unknown;
    created_at: string | null;
  }>(SQL_EDGES_BASE + where + order, args);
  return rows;
}
