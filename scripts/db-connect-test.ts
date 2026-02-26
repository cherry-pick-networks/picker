/**
 * One-off DB connection test.
 * Usage: ./scripts/dev.sh deno run -A scripts/db-connect-test.ts
 */
import { getPg } from "../shared/infra/pg.client.ts";
import { loadSql } from "../shared/infra/sql-loader.ts";

const sqlDir = new URL("./sql/", import.meta.url);
const SQL_PING = await loadSql(sqlDir, "ping.sql");

const pg = await getPg();
const r = await pg.queryObject<{ ok: number }>(SQL_PING);
console.log("DB connection OK:", r.rows[0]);
await pg.end();
