/**
 * Task queue store. enqueue/dequeue/complete/fail; dequeue uses
 * queue-store.helpers.selectAndLockPendingTasks (FOR UPDATE SKIP LOCKED).
 */

import { getPg, withTx } from "#shared/infra/pg.client.ts";
import type { Sql } from "#shared/infra/pg.types.ts";
import type { EnqueueTask, Task } from "./queue.schema.ts";
import { selectAndLockPendingTasks } from "./queue-store.helpers.ts";

const SQL_INSERT =
  "INSERT INTO task_queue (kind, payload, status) VALUES ($1, $2, 'pending') " +
  "RETURNING id, kind, payload, status, created_at, started_at, " +
  "finished_at, error_message";
const SQL_MARK_RUNNING =
  "UPDATE task_queue SET status = 'running', started_at = now() " +
  "WHERE id = ANY($1::uuid[]) " +
  "RETURNING id, kind, payload, status, created_at, started_at, " +
  "finished_at, error_message";
const SQL_COMPLETE =
  "UPDATE task_queue SET status = 'completed', finished_at = now() " +
  "WHERE id = $1 RETURNING id";
const SQL_FAIL =
  "UPDATE task_queue SET status = 'failed', finished_at = now(), " +
  "error_message = $2 WHERE id = $1 RETURNING id";

// function-length-ignore (mapping row to Task, many fields)
function rowToTask(r: {
  id: string;
  kind: string;
  payload: unknown;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
}): Task {
  return {
    id: r.id,
    kind: r.kind,
    payload: (r.payload as Record<string, unknown>) ?? undefined,
    status: r.status as Task["status"],
    created_at: r.created_at,
    started_at: r.started_at ?? undefined,
    finished_at: r.finished_at ?? undefined,
    error_message: r.error_message ?? undefined,
  };
}

export async function enqueue(task: EnqueueTask): Promise<Task> {
  const sql = await getPg();
  const payload = JSON.stringify(task.payload ?? {});
  const { rows } = await sql.queryObject<{
    id: string;
    kind: string;
    payload: unknown;
    status: string;
    created_at: string;
    started_at: string | null;
    finished_at: string | null;
    error_message: string | null;
  }>(SQL_INSERT, [task.kind, payload]);
  return rowToTask(rows[0]);
}

type TaskRowDb = {
  id: string;
  kind: string;
  payload: unknown;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
};

async function runDequeueInTx(
  sql: Sql,
  opts: { kind?: string; limit?: number },
): Promise<Task[]> {
  const locked = await selectAndLockPendingTasks(sql, opts);
  if (locked.length === 0) return [];
  const { rows } = await sql.queryObject<TaskRowDb>(
    SQL_MARK_RUNNING,
    [locked.map((r) => r.id)],
  );
  return rows.map(rowToTask);
}

export function dequeue(opts?: {
  kind?: string;
  limit?: number;
}): Promise<Task[]> {
  return withTx((sql) => runDequeueInTx(sql, opts ?? {}));
}

export async function complete(id: string): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_COMPLETE, [id]);
}

export async function fail(id: string, reason?: string): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_FAIL, [id, reason ?? null]);
}
