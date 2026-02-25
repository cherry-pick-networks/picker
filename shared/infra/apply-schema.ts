/**
 * Apply DDL in shared/infra/schema/*.sql in order. Requires DATABASE_URL or
 * PG_* env. Usage: deno run -A shared/infra/apply-schema.ts
 */

import { getPg } from "./pg.client.ts";

const SCHEMA_DIR = new URL("./schema/", import.meta.url);

function splitStatements(sql: string): string[] {
  const parts = sql.split(";").map((s) => s.trim());
  return parts.filter((s) => s.length > 0 && /^\s*CREATE\s/i.test(s));
}

async function applySchema(): Promise<void> {
  const pg = await getPg();
  const files = ["01_actor.sql", "02_source.sql", "03_kv.sql", "04_content.sql"];
  for (const name of files) {
    const url = new URL(name, SCHEMA_DIR);
    const sql = await Deno.readTextFile(url);
    for (const stmt of splitStatements(sql)) {
      await pg.queryArray(stmt + ";");
    }
  }
  await pg.end();
}

applySchema().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
