//
// Apply DDL in shared/infra/schema/*.sql in order. Requires DATABASE_URL or
// PG_* env. Run: deno task db:schema
//
import { getPath } from '#context/scripts/pathConfig.ts';
import { getPg } from './pgClient.ts';

function stripLeadingComments(block: string): string {
  const noComments = block.replace(
    /^\s*(--[^\n]*\n)*/m,
    '',
  );
  return noComments.trim();
}

function splitStatements(sql: string): string[] {
  const parts = sql.split(';').map((s) => s.trim());
  return parts
    .map(stripLeadingComments)
    .filter((s) => s.length > 0 && /^\s*CREATE\s/i.test(s));
}

const SCHEMA_FILES = [
  '01_actor.sql',
  '02_source.sql',
  '03_kv.sql',
  '04_content.sql',
  '05_vector.sql',
  '06_ontology.sql',
  '07_schedule.sql',
  '08_curriculum.sql',
  '09_lexis-entry.sql',
  '10_unit-concept.sql',
  '11_item-embedding.sql',
  '12_achievement.sql',
  '13_content-item-source-index.sql',
];

async function applySchema(): Promise<void> {
  const pg = await getPg();
  const schemaDir = `${Deno.cwd()}/${
    getPath('infraSchema')
  }`;
  for (const name of SCHEMA_FILES) {
    const sql = await Deno.readTextFile(
      `${schemaDir}/${name}`,
    );
    for (const stmt of splitStatements(sql)) {
      await pg.queryArray(stmt + ';');
    }
  }
  await pg.end();
}

applySchema().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
