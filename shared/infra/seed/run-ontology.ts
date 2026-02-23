/**
 * Run idempotent ontology seed (shared/infra/seed/ontology.sql).
 * Requires: DATABASE_URL or PG* env; 05_ontology.sql DDL applied.
 * Run: deno task seed:ontology
 */

import { withTx } from "#shared/infra/pg.client.ts";

const SEED_PATH = new URL("ontology.sql", import.meta.url);

async function runSeed(): Promise<void> {
  const body = await Deno.readTextFile(SEED_PATH);
  const statements = body
    .split(/;\s*\n/)
    .map((s) => s.replace(/--[^\n]*/g, "").trim())
    .filter((s) => s.length > 0);

  await withTx(async (sql) => {
    for (const st of statements) {
      await sql.queryArray(st + ";");
    }
  });
}

runSeed()
  .then(() => {
    console.log("Ontology seed done.");
  })
  .catch((e) => {
    console.error("Ontology seed failed:", e);
    Deno.exit(1);
  });
