/**
 * Run ontology seed SQL. Requires db:schema applied first. Usage:
 * deno run -A shared/infra/seed/run-seed-ontology.ts
 */

import { getPg } from "../pg.client.ts";

const SEED_FILE = new URL("./ontology/seed.sql", import.meta.url);

function stripLeadingComments(block: string): string {
  const noComments = block.replace(/^\s*(--[^\n]*\n)*/m, "");
  return noComments.trim();
}

function splitStatements(sql: string): string[] {
  const parts = sql.split(";").map((s) => stripLeadingComments(s.trim()));
  return parts.filter((s) => s.length > 0 && /^\s*INSERT\s/i.test(s));
}

async function runSeed(): Promise<void> {
  const pg = await getPg();
  const sql = await Deno.readTextFile(SEED_FILE);
  for (const stmt of splitStatements(sql)) {
    await pg.queryArray(stmt + ";");
  }
  await pg.end();
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
