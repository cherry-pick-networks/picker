/**
 * One-off DB connection test.
 * Usage: ./scripts/dev.sh deno run -A scripts/db-connect-test.ts
 */
import { getPg } from "../shared/infra/pg.client.ts";

const pg = await getPg();
const r = await pg.queryObject<{ ok: number }>("SELECT 1 as ok");
console.log("DB connection OK:", r.rows[0]);
await pg.end();
