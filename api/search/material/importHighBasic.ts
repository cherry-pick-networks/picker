//
// One-off import: lexis-high-basic 1200 headwords into lexis_entry.
// Requires: source "lexis-high-basic" exists (run seed:material first), DB env.
//
// Usage:
//   deno run -A application/content/material/importHighBasic.ts
//   deno run -A application/content/material/importHighBasic.ts --write-headwords
//     Copies data/lexis-high-basic-headwords.json to temp/, then imports.
//

import { getPg } from '#api/postgresql/pgClient.ts';
import { loadSql } from '#api/postgresql/sqlLoader.ts';
import { loadHeadwords } from './importHighBasicLoad.ts';

const lexisSqlDir = new URL('./sql/', import.meta.url);
const SQL_UPSERT_LEXIS_ENTRY = await loadSql(
  lexisSqlDir,
  'upsert_lexis_entry.sql',
);

const SOURCE_ID = 'lexis-high-basic';
const WORDS_PER_DAY = 40;

function dayIndex(entryIndex: number): number {
  return Math.ceil(entryIndex / WORDS_PER_DAY);
}

async function importHeadwordsToPg(
  pg: Awaited<ReturnType<typeof getPg>>,
  headwords: string[],
): Promise<void> {
  for (let i = 0; i < headwords.length; i++) {
    const entryIndex = i + 1;
    const day = dayIndex(entryIndex);
    const headword = headwords[i].trim();
    await pg.queryArray(SQL_UPSERT_LEXIS_ENTRY, [
      SOURCE_ID,
      entryIndex,
      day,
      headword,
    ]);
  }
  console.log(
    'Imported',
    headwords.length,
    'entries for',
    SOURCE_ID,
  );
}

async function main(): Promise<void> {
  const headwords = await loadHeadwords();
  const pg = await getPg();
  await importHeadwordsToPg(pg, headwords);
  await pg.end();
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
