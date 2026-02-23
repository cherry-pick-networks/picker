/**
 * Queue store query helpers. SELECT FOR UPDATE SKIP LOCKED only; used by
 * queue.store.ts inside a transaction for dequeue.
 */

import type { Sql } from "#shared/infra/pg.types.ts";

export type TaskRow = {
  id: string;
  kind: string;
  payload: unknown;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
};

const BASE =
  "SELECT id, kind, payload, status, created_at, started_at, finished_at, " +
  "error_message FROM task_queue WHERE status = 'pending'";
const FOR_LOCK = " FOR UPDATE SKIP LOCKED";

// function-length-ignore (query-building: where/limit then execute)
export async function selectAndLockPendingTasks(
  sql: Sql,
  opts: { kind?: string; limit?: number },
): Promise<TaskRow[]> {
  const parts: string[] = [];
  const args: unknown[] = [];
  let i = 0;
  if (opts.kind != null) {
    i++;
    parts.push(`kind = $${i}`);
    args.push(opts.kind);
  }
  const where = parts.length ? " AND " + parts.join(" AND ") : "";
  const orderLimit = " ORDER BY created_at ASC";
  if (opts.limit != null) {
    i++;
    args.push(opts.limit);
  }
  const limitClause = opts.limit != null ? ` LIMIT $${i}` : "";
  const q = BASE + where + orderLimit + limitClause + FOR_LOCK;
  const { rows } = await sql.queryObject<TaskRow>(q, args);
  return rows;
}
