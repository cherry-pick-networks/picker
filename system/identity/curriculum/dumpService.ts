//
// Curriculum dump for external-standard mapping: build text from
// curriculum_slot / 52-weeks grid and grammar units for one LLM call.
//

import { getPath } from '#context/scripts/pathConfig.ts';
import { IdentityStores } from '#system/identity/IdentityStores.ts';
import { listGrammarUnits } from '#system/identity/schedule/grammarService.ts';

export interface DumpInput {
  level: string;
  includeTopicHint?: boolean;
}

function slotLines(
  _level: string,
  rows: {
    week_number: number;
    slot_index: number;
    source_id: string;
    unit_id: string;
  }[],
): string[] {
  const lines = rows.map((r) =>
    `${r.week_number},${r.slot_index},${r.source_id},${r.unit_id}`
  );
  return lines;
}

async function dumpFromStore(
  level: string,
): Promise<string> {
  const rows = await IdentityStores.curriculumStore
    .listCurriculumSlots(
      level,
    );
  if (rows.length === 0) return '';
  const header = 'week_number,slot_index,source_id,unit_id';
  return `level: ${level}\n${
    [header, ...slotLines(level, rows)].join('\n')
  }`;
}

function buildGrammarFallbackLines(
  units: Awaited<ReturnType<typeof listGrammarUnits>>,
): string[] {
  const slots = 52 * 3;
  const lines: string[] = [];
  for (let i = 0; i < slots; i++) {
    const u = units[i % units.length];
    const week = Math.floor(i / 3) + 1;
    const slot = i % 3;
    lines.push(
      `${week},${slot},${u.source_id},${u.unit_id}`,
    );
  }
  return lines;
}

async function dumpFromGrammarFallback(
  level: string,
): Promise<string> {
  const units = await listGrammarUnits(level);
  if (units.length === 0) return '';
  const header =
    `level: ${level}\n(ordered by unit; week inferred)\nweek_number,slot_index,source_id,unit_id\n`;
  return header +
    buildGrammarFallbackLines(units).join('\n');
}

//
// Build mapping input text: internal curriculum (52 weeks × 3 slots)
// as CSV. Prefer DB curriculum_slot; fallback to grammar units order.
//
export async function buildDumpText(
  input: DumpInput,
): Promise<string> {
  const fromStore = await dumpFromStore(input.level);
  if (fromStore.length > 0) return fromStore;
  return dumpFromGrammarFallback(input.level);
}

//
// Load grammar-topics summary for optional LLM hint (level scope).
// Content consolidated into MANUAL.md § Grammar topics; if file
// missing, returns empty string.
//
export async function loadGrammarTopicsHint(): Promise<
  string
> {
  try {
    const base = getPath('contextDocs');
    const path = `${base}/MANUAL.md`;
    const raw = await Deno.readTextFile(path);
    const summary = raw.slice(0, 2000);
    return `Grammar topics (reference):\n${summary}`;
  } catch {
    return '';
  }
}
