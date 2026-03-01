//
// List tables with row counts and sample IDs. Needs DB (e.g. ./scripts/dev.sh).
// Usage: ./scripts/dev.sh deno run -A application/infra/dbListAll.ts
//
import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const listAllDir = new URL(
  './',
  import.meta.url,
);
const tables: { name: string }[] = [
  { name: 'actor_profile' },
  { name: 'actor_progress' },
  { name: 'source' },
  { name: 'kv' },
  { name: 'content_item' },
  { name: 'schedule_item' },
  { name: 'concept_scheme' },
  { name: 'concept' },
  { name: 'concept_relation' },
  { name: 'curriculum_slot' },
];

const sqlMap = new Map<
  string,
  { count: string; sample: string }
>();
for (const { name } of tables) {
  sqlMap.set(name, {
    count: await loadSql(listAllDir, `count_${name}.sql`),
    sample: await loadSql(listAllDir, `sample_${name}.sql`),
  });
}

const pg = await getPg();

console.log('=== DB table counts and samples ===\n');

for (const { name } of tables) {
  try {
    const { count: countSql, sample: sampleSql } = sqlMap
      .get(name)!;
    const countR = await pg.queryObject<{ n: number }>(
      countSql,
    );
    const n = countR.rows[0]?.n ?? 0;
    let sample = '';
    if (n > 0) {
      const sampleR = await pg.queryArray(sampleSql);
      sample = '  sample: ' + JSON.stringify(sampleR.rows);
    }
    console.log(`${name}: ${n}${sample}`);
  } catch (e) {
    console.log(
      `${name}: (table missing or error) ${String(e)}`,
    );
  }
}

await pg.end();
console.log('\nDone.');
