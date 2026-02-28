/**
 * Delete dummy/test data from DB. Requires DB env (e.g. ./scripts/dev.sh).
 * Usage:
 *   ./scripts/dev.sh deno run -A scripts/db-clean-dummy.ts        # dry-run
 *   ./scripts/dev.sh deno run -A scripts/db-clean-dummy.ts --execute
 */
import { getPg } from "../shared/infra/pgClient.ts";
import { loadSql } from "../shared/infra/sqlLoader.ts";

const sqlDir = new URL("./sql/", import.meta.url);
const SQL_DELETE_KV = await loadSql(sqlDir, "delete_kv_by_pattern.sql");
const SQL_DELETE_SOURCE = await loadSql(sqlDir, "delete_source_test.sql");
const SQL_CHECK_SCHEDULE_ITEM = await loadSql(
  sqlDir,
  "check_schedule_item_exists.sql",
);
const SQL_DELETE_SCHEDULE_ITEMS = await loadSql(
  sqlDir,
  "delete_schedule_items_test.sql",
);
const SQL_DELETE_ACTOR_PROFILE = await loadSql(
  sqlDir,
  "delete_actor_profile_test.sql",
);
const SQL_DELETE_ACTOR_PROGRESS = await loadSql(
  sqlDir,
  "delete_actor_progress_test.sql",
);
const SQL_DELETE_CONTENT_ITEM = await loadSql(
  sqlDir,
  "delete_content_item_test.sql",
);
const SQL_DELETE_CONTENT_WORKSHEET = await loadSql(
  sqlDir,
  "delete_content_worksheet_test.sql",
);

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

// KV: test/e2e/del/list/pfx/other prefix keys (mainKv_test, e2e)
const kvPatterns = ["test-%", "e2e-%", "del-%", "list-%", "pfx-%", "other-%"];
for (const pattern of kvPatterns) {
  await del(`kv (${pattern})`, SQL_DELETE_KV, [pattern]);
}

// source: test-style IDs (no-body-*, extract-ok-*); keep book-grammar-*
await del("source (no-body-*, extract-ok-*)", SQL_DELETE_SOURCE, [
  "no-body-%",
  "extract-ok-%",
]);

// schedule_item: delete test-style actor_id/source_id if table exists
try {
  await pg.queryArray(SQL_CHECK_SCHEDULE_ITEM);
  await del("schedule_item (test actor/source)", SQL_DELETE_SCHEDULE_ITEMS, [
    "%test%",
    "%e2e%",
    "no-body-%",
    "extract-ok-%",
  ]);
} catch {
  // table may not exist
}

// actor_profile / actor_progress: test/demo/e2e IDs
await del("actor_profile (test/demo/e2e)", SQL_DELETE_ACTOR_PROFILE, [
  "%test%",
  "%demo%",
  "%e2e%",
]);
await del("actor_progress (test/demo/e2e)", SQL_DELETE_ACTOR_PROGRESS, [
  "%test%",
  "%demo%",
  "%e2e%",
]);

// content: test-style IDs
await del("content_item (test/demo)", SQL_DELETE_CONTENT_ITEM, [
  "%test%",
  "%demo%",
]);
await del("content_worksheet (test/demo)", SQL_DELETE_CONTENT_WORKSHEET, [
  "%test%",
  "%demo%",
]);

await pg.end();
if (!execute) {
  console.log("\nRun with --execute to apply deletions.");
} else {
  console.log("\nDone.");
}
