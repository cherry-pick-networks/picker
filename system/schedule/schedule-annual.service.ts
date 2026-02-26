/** Annual curriculum: 52 weeks × 3 slots; identified by week number (1–52), not weekday. */

import { listGrammarUnits } from "./schedule-grammar.service.ts";

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

/** Returns 52 weeks; each week has week_number (1–52) and 3 slots. */
export async function getAnnualCurriculum(options: {
  level?: string;
  year: number;
}): Promise<AnnualCurriculum> {
  const units = await listGrammarUnits(options.level);
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
