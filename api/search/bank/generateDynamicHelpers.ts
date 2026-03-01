//
// Helpers for dynamic item generation: allowlist validation, LLM output → Item.
//

import { getAllowlistDataOrLoad } from '#api/config/allowlistData.ts';
import {
  allowlistHas,
  type FacetName,
} from '#api/config/allowlistTypes.ts';
import type { Item } from './schema.ts';
import { nowIso } from './schemaParseService.ts';

export async function validateAllowlist(
  conceptIds: string[],
  subjectIds: string[] | undefined,
): Promise<void> {
  const data = await getAllowlistDataOrLoad();
  for (const id of conceptIds) {
    if (!allowlistHas(data, 'concept' as FacetName, id)) {
      throw new Error(`Invalid concept_id: ${id}`);
    }
  }
  if (subjectIds?.length) {
    for (const id of subjectIds) {
      if (!allowlistHas(data, 'subject' as FacetName, id)) {
        throw new Error(`Invalid subject_id: ${id}`);
      }
    }
  }
}

export function toItem(
  raw: {
    stem: string;
    options: string[];
    correct: number;
    explanation?: string;
  },
  conceptId: string,
  subjectIds: string[] | undefined,
): Item {
  const item_id = crypto.randomUUID();
  const created_at = nowIso();
  const parameters = raw.explanation
    ? { explanation: raw.explanation }
    : undefined;
  return {
    item_id,
    concept_id: conceptId,
    subject_ids: subjectIds,
    stem: raw.stem,
    options: raw.options,
    correct: raw.correct,
    created_at,
    parameters,
  };
}
