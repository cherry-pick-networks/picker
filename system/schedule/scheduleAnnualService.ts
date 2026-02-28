/** Annual curriculum: 52 weeks × 3 slots; week number (1–52), not weekday. */

import * as curriculumStore from "./curriculumStore.ts";
import { listGrammarUnits } from "./scheduleGrammarService.ts";

const SLOTS_PER_WEEK = 3;

export interface AnnualSlot {
  slot_index: number;
  new_unit: { source_id: string; unit_id: string } | null;
}

export interface AnnualWeek {
  week_number: number;
  slots: AnnualSlot[];
}

export interface AnnualCurriculum {
  weeks: AnnualWeek[];
}

async function buildFromCurriculumStore(
  level: string,
): Promise<AnnualCurriculum> {
  const rows = await curriculumStore.listCurriculumSlots(level);
  const weeks: AnnualWeek[] = Array.from({ length: 52 }, (_, i) => ({
    week_number: i + 1,
    slots: [0, 1, 2].map((slot_index) => ({
      slot_index,
      new_unit: null as { source_id: string; unit_id: string } | null,
    })),
  }));
  for (const row of rows) {
    const w = weeks[row.week_number - 1];
    if (w) {
      w.slots[row.slot_index].new_unit = {
        source_id: row.source_id,
        unit_id: row.unit_id,
      };
    }
  }
  return { weeks };
}

// function-length-ignore
async function buildFromGrammarUnits(
  level: string | undefined,
): Promise<AnnualCurriculum> {
  const units = await listGrammarUnits(level);
  const weeks: AnnualWeek[] = [];
  let unitIndex = 0;
  for (let w = 1; w <= 52; w++) {
    const slots: AnnualSlot[] = [];
    for (let si = 0; si < SLOTS_PER_WEEK; si++) {
      const u = units[unitIndex] ?? null;
      if (u) unitIndex++;
      slots.push({
        slot_index: si,
        new_unit: u ? { source_id: u.source_id, unit_id: u.unit_id } : null,
      });
    }
    weeks.push({ week_number: w, slots });
  }
  return { weeks };
}

/** Returns 52 weeks; each week has week_number (1–52) and 3 slots. */
export async function getAnnualCurriculum(options: {
  level?: string;
  year: number;
}): Promise<AnnualCurriculum> {
  if (options.level) return await buildFromCurriculumStore(options.level);
  return await buildFromGrammarUnits(options.level);
}
