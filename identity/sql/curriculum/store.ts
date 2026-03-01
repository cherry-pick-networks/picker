//  Curriculum slot storage (52-week grid per level). Read-only at runtime.

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL("./", import.meta.url);
const SQL_LIST_BY_LEVEL = await loadSql(
  sqlDir,
  'list_curriculum_slots.sql',
);

export interface CurriculumSlotRow {
  level: string;
  week_number: number;
  slot_index: number;
  source_id: string;
  unit_id: string;
}

export async function listCurriculumSlots(
  level: string,
): Promise<CurriculumSlotRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<CurriculumSlotRow>(
    SQL_LIST_BY_LEVEL,
    [
      level,
    ],
  );
  return r.rows;
}
