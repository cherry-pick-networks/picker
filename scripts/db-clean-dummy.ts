/**
 * Delete dummy/test data from DB. Requires DB env (e.g. ./scripts/dev.sh).
 * Usage:
 *   ./scripts/dev.sh deno run -A scripts/db-clean-dummy.ts        # dry-run
 *   ./scripts/dev.sh deno run -A scripts/db-clean-dummy.ts --execute
 */
import { getPg } from "../shared/infra/pg.client.ts";

const execute = Deno.args.includes("--execute");
const pg = await getPg();

async function dryRunCount(
  label: string,
  sql: string,
  params: unknown[],
): Promise<number> {
  const countSql = sql
    .replace(/^\s*DELETE\s+FROM\s+/i, "SELECT count(*)::int as n FROM ");
  const countR = await pg.queryObject<{ n: number }>(countSql, params);
  console.log(
    `[dry-run] ${label}: would delete ${countR.rows[0]?.n ?? 0} row(s)`,
  );
  return countR.rows[0]?.n ?? 0;
}

// function-length-ignore
async function runDelete(
  label: string,
  sql: string,
  params: unknown[],
): Promise<number> {
  const returnSql = sql.replace(/;\s*$/, "") + " RETURNING 1";
  const r = await pg.queryArray(returnSql, params);
  const n = (r as { rows: unknown[][] }).rows?.length ?? 0;
  console.log(`${label}: deleted ${n} row(s)`);
  return n;
}

async function del(
  label: string,
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  if (!execute) return await dryRunCount(label, sql, params);
  return await runDelete(label, sql, params);
}

// KV: test/e2e/del/list/pfx/other prefix keys (main-kv_test, e2e)
const kvPatterns = ["test-%", "e2e-%", "del-%", "list-%", "pfx-%", "other-%"];
for (const pattern of kvPatterns) {
  await del(`kv (${pattern})`, "DELETE FROM kv WHERE logical_key LIKE $1", [
    pattern,
  ]);
}

// source: test-style IDs (no-body-*, extract-ok-*); keep book-grammar-*
const sourceSql =
  "DELETE FROM source WHERE source_id LIKE $1 OR source_id LIKE $2";
await del("source (no-body-*, extract-ok-*)", sourceSql, [
  "no-body-%",
  "extract-ok-%",
]);

// schedule_item: delete test-style actor_id/source_id if table exists
try {
  await pg.queryArray("SELECT 1 FROM schedule_item LIMIT 1");
  await del(
    "schedule_item (test actor/source)",
    `DELETE FROM schedule_item
     WHERE actor_id LIKE $1 OR actor_id LIKE $2
       OR source_id LIKE $3 OR source_id LIKE $4`,
    ["%test%", "%e2e%", "no-body-%", "extract-ok-%"],
  );
} catch {
  // table may not exist
}

// actor_profile / actor_progress: test/demo/e2e IDs
await del(
  "actor_profile (test/demo/e2e)",
  "DELETE FROM actor_profile WHERE id ILIKE $1 OR id ILIKE $2 OR id ILIKE $3",
  ["%test%", "%demo%", "%e2e%"],
);
await del(
  "actor_progress (test/demo/e2e)",
  "DELETE FROM actor_progress WHERE id ILIKE $1 OR id ILIKE $2 OR id ILIKE $3",
  ["%test%", "%demo%", "%e2e%"],
);

// content: test-style IDs
await del(
  "content_item (test/demo)",
  "DELETE FROM content_item WHERE id ILIKE $1 OR id ILIKE $2",
  ["%test%", "%demo%"],
);
await del(
  "content_worksheet (test/demo)",
  "DELETE FROM content_worksheet WHERE id ILIKE $1 OR id ILIKE $2",
  ["%test%", "%demo%"],
);

await pg.end();
if (!execute) {
  console.log("\nRun with --execute to apply deletions.");
} else {
  console.log("\nDone.");
}
