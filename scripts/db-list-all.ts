/**
 * List tables with row counts and sample IDs. Needs DB (e.g. ./scripts/dev.sh).
 * Usage: ./scripts/dev.sh deno run -A scripts/db-list-all.ts
 */
import { getPg } from "../shared/infra/pg.client.ts";

const pg = await getPg();

const tables: { name: string; idColumn: string }[] = [
  { name: "actor_profile", idColumn: "id" },
  { name: "actor_progress", idColumn: "id" },
  { name: "source", idColumn: "source_id" },
  { name: "kv", idColumn: "logical_key" },
  { name: "content_item", idColumn: "id" },
  { name: "content_worksheet", idColumn: "id" },
  { name: "schedule_item", idColumn: "actor_id" },
  { name: "concept_scheme", idColumn: "scheme_id" },
  { name: "concept", idColumn: "scheme_id" },
  { name: "concept_relation", idColumn: "source_scheme_id" },
  { name: "curriculum_slot", idColumn: "level" },
];

console.log("=== DB table counts and samples ===\n");

for (const { name, idColumn } of tables) {
  try {
    const countR = await pg.queryObject<{ n: number }>(
      `SELECT count(*)::int as n FROM ${name}`,
    );
    const n = countR.rows[0]?.n ?? 0;
    let sample = "";
    if (n > 0) {
      const cols = name === "schedule_item"
        ? "actor_id, source_id, unit_id"
        : name === "curriculum_slot"
        ? "level, week_number, slot_index, source_id, unit_id"
        : idColumn;
      const sampleR = await pg.queryArray(
        `SELECT ${cols} FROM ${name} LIMIT 5`,
      );
      sample = "  sample: " + JSON.stringify(sampleR.rows);
    }
    console.log(`${name}: ${n}${sample}`);
  } catch (e) {
    console.log(`${name}: (table missing or error) ${String(e)}`);
  }
}

await pg.end();
console.log("\nDone.");
