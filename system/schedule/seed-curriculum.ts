// function-length-ignore-file — Seed curriculum_slot from curriculum-52weeks.json.
/**
 * Requires db:schema (08_curriculum) and grammar sources in source table.
 * Usage: deno run -A system/schedule/seed-curriculum.ts
 */

import { getPg } from "#shared/infra/pg.client.ts";
import { listGrammarUnits } from "./schedule-grammar.service.ts";

const CURRICULUM_JSON = new URL(
  "../../../shared/infra/seed/curriculum-52weeks.json",
  import.meta.url,
);

const LEVELS = ["basic", "intermediate", "advanced"] as const;

interface CurriculumJson {
  basic?: { weeks: number[][] };
  intermediate?: { weeks: number[][] };
  advanced?: { weeks: number[][] };
}

async function runSeed(): Promise<void> {
  const raw = await Deno.readTextFile(CURRICULUM_JSON);
  const data = JSON.parse(raw) as CurriculumJson;

  const pg = await getPg();

  for (const level of LEVELS) {
    const levelData = data[level]?.weeks;
    if (!levelData || levelData.length !== 52) {
      console.warn(`Skipping ${level}: missing or invalid weeks`);
      continue;
    }

    const units = await listGrammarUnits(level);
    if (units.length === 0) {
      console.warn(`Skipping ${level}: no grammar units in source`);
      continue;
    }

    for (let week = 0; week < 52; week++) {
      const slotNums = levelData[week];
      if (!slotNums || slotNums.length !== 3) continue;
      for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
        const unitNum = slotNums[slotIndex];
        const index = (unitNum - 1) % units.length;
        const { source_id, unit_id } = units[index];
        await pg.queryArray(
          `INSERT INTO curriculum_slot (level, week_number, slot_index, source_id, unit_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (level, week_number, slot_index)
           DO UPDATE SET source_id = EXCLUDED.source_id, unit_id = EXCLUDED.unit_id`,
          [level, week + 1, slotIndex, source_id, unit_id],
        );
      }
    }
  }

  await pg.end();
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
