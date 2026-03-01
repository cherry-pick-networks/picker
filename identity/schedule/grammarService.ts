//  Grammar sources: list (source_id, unit_id) from metadata.unit_ids.

import { listSources } from '#api/storage/catalog/service.ts';

const GRAMMAR_SOURCE_PREFIX = 'book-grammar-';

export async function listGrammarUnits(
  level?: string,
): Promise<
  { source_id: string; unit_id: string; level?: string }[]
> {
  const sources = await listSources();
  const out: {
    source_id: string;
    unit_id: string;
    level?: string;
  }[] = [];
  for (const s of sources) {
    if (!s.source_id.startsWith(GRAMMAR_SOURCE_PREFIX)) {
      continue;
    }
    const meta = s.metadata as
      | { level?: string; unit_ids?: string[] }
      | undefined;
    const unitIds = meta?.unit_ids ?? [];
    const lvl = level ?? meta?.level;
    if (level != null && lvl !== level) continue;
    for (const unitId of unitIds) {
      out.push({
        source_id: s.source_id,
        unit_id: unitId,
        level: lvl,
      });
    }
  }
  return out;
}
