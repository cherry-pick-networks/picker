/** Curriculum slot storage (52-week grid per level). Read-only at runtime. */

import { getPg } from "#shared/infra/pg.client.ts";
import { loadSql } from "#shared/infra/sql-loader.ts";

const sqlDir = new URL("./sql/", import.meta.url);
const SQL_LIST_BY_LEVEL = await loadSql(sqlDir, "list_curriculum_slots.sql");

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
  const r = await pg.queryObject<CurriculumSlotRow>(SQL_LIST_BY_LEVEL, [
    level,
  ]);
  return r.rows;
}
