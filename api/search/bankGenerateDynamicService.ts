//
// Dynamic item generation: validate request, resolve concept labels,
// call LLM, return ItemSchema-compatible items.
//

import { z } from 'zod';
import { GovernanceStores } from '#api/config/GovernanceStores.ts';
import type { Item } from './bankSchema.ts';
import {
  toItem,
  validateAllowlist,
} from './bankGenerateDynamicHelpers.ts';
import { ContentLlmService } from '#api/storage/ContentLlmService.ts';

export const MIN_CONCEPTS = 2;
export const MAX_CONCEPTS = 3;

export const GenerateDynamicRequestSchema = z.object({
  concept_ids: z.array(z.string()),
  count: z.number().int().min(1),
  subject_ids: z.array(z.string()).optional(),
});
export type GenerateDynamicInput = z.infer<
  typeof GenerateDynamicRequestSchema
>;

export type GenerateDynamicResult =
  | { ok: true; items: Item[] }
  | { ok: false; error: string };

function validateCount(
  conceptIds: string[],
): GenerateDynamicResult | null {
  if (
    conceptIds.length < MIN_CONCEPTS ||
    conceptIds.length > MAX_CONCEPTS
  ) {
    return {
      ok: false,
      error:
        `concept_ids must have ${MIN_CONCEPTS}–${MAX_CONCEPTS} items`,
    };
  }
  return null;
}

async function getLabelsOrFail(
  conceptIds: string[],
  subjectIds: string[] | undefined,
): Promise<
  { ok: true; labels: string[] } | {
    ok: false;
    error: string;
  }
> {
  try {
    await validateAllowlist(conceptIds, subjectIds);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
  const labelsMap = await GovernanceStores.conceptStore
    .getConceptPrefLabels(conceptIds);
  const missing = conceptIds.filter((id) =>
    !labelsMap.has(id)
  );
  return missing.length > 0
    ? {
      ok: false,
      error: `Unknown concept_id(s): ${missing.join(', ')}`,
    }
    : {
      ok: true,
      labels: conceptIds.map((id) => labelsMap.get(id)!),
    };
}

async function generateAndBuildItems(
  labels: string[],
  count: number,
  primaryConceptId: string,
  subjectIds: string[] | undefined,
): Promise<GenerateDynamicResult> {
  const llm = await ContentLlmService.generateItemsViaLlm(
    labels,
    count,
  );
  if (!llm.ok) return { ok: false, error: llm.error };
  const items: Item[] = llm.output.items.map((raw) =>
    toItem(raw, primaryConceptId, subjectIds)
  );
  return { ok: true, items };
}

export async function generateDynamicItems(
  input: GenerateDynamicInput,
): Promise<GenerateDynamicResult> {
  const countErr = validateCount(input.concept_ids);
  if (countErr) return countErr;
  const labelsResult = await getLabelsOrFail(
    input.concept_ids,
    input.subject_ids,
  );
  return !labelsResult.ok
    ? labelsResult
    : generateAndBuildItems(
      labelsResult.labels,
      input.count,
      input.concept_ids[0],
      input.subject_ids,
    );
}
