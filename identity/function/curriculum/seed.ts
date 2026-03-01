//
// Requires db:schema (08_curriculum) and grammar sources in source table.
// Run: deno task seed:curriculum
//

import { JsonParseStream } from '@std/json/parse-stream';
import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';
import { listGrammarUnits } from '#identity/app/schedule/grammarService.ts';

const sqlDir = new URL(
  '../../sql/curriculum/',
  import.meta.url,
);
const SQL_UPSERT_CURRICULUM_SLOT = await loadSql(
  sqlDir,
  'upsert_curriculum_slot.sql',
);

const CURRICULUM_JSON = new URL(
  '../../../../sharepoint/infra/seed/curriculum-52weeks.json',
  import.meta.url,
);

const LEVELS = [
  'basic',
  'intermediate',
  'advanced',
] as const;

interface CurriculumJson {
  basic?: { weeks: number[][] };
  intermediate?: { weeks: number[][] };
  advanced?: { weeks: number[][] };
}

async function parseJsonStream(
  raw: string,
): Promise<CurriculumJson> {
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode(raw));
      c.close();
    },
  });
  const reader = stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new JsonParseStream())
    .getReader();
  const { value } = await reader.read();
  return value as CurriculumJson;
}

// function-length-ignore — read + for-each-level seed.
async function runSeed(): Promise<void> {
  const raw = await Deno.readTextFile(CURRICULUM_JSON);
  const data = await parseJsonStream(raw);

  const pg = await getPg();

  for (const level of LEVELS) {
    const levelData = data[level]?.weeks;
    if (!levelData || levelData.length !== 52) {
      console.warn(
        `Skipping ${level}: missing or invalid weeks`,
      );
      continue;
    }

    const units = await listGrammarUnits(level);
    if (units.length === 0) {
      console.warn(
        `Skipping ${level}: no grammar units in source`,
      );
      continue;
    }

    for (let week = 0; week < 52; week++) {
      const slotNums = levelData[week];
      if (!slotNums || slotNums.length !== 3) continue;
      for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
        const unitNum = slotNums[slotIndex];
        const index = (unitNum - 1) % units.length;
        const { source_id, unit_id } = units[index];
        await pg.queryArray(SQL_UPSERT_CURRICULUM_SLOT, [
          level,
          week + 1,
          slotIndex,
          source_id,
          unit_id,
        ]);
      }
    }
  }

  await pg.end();
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
