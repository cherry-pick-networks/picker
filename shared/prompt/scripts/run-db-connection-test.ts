/**
 * Test Postgres connection. Requires DATABASE_URL or PG_* env.
 * Usage: deno run -A shared/prompt/scripts/run-db-connection-test.ts
 */

import { getPg } from "#shared/infra/pg.client.ts";

async function main(): Promise<void> {
  const pg = await getPg();
  await pg.queryArray("SELECT 1");
  await pg.end();
  console.log("DB connection OK");
}

main().catch((e) => {
  console.error("DB connection failed:", e);
  Deno.exit(1);
});
