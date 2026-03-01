//
// Review text → ontology mapping: LLM then allowlist validation.
//

import {
  ALLOWLIST_ID_COUNT_LIMIT,
  allowlistHas,
} from '#api/config/allowlistTypes.ts';
import { getAllowlistDataOrLoad } from '#api/config/allowlistData.ts';
import { ContentLlmService } from '#api/storage/ContentLlmService.ts';

export type ReviewMappingOk = {
  ok: true;
  concept_ids: string[];
  mapped_at: string;
};
export type ReviewMappingFail = {
  ok: false;
  status: 400 | 502;
  message: string;
};
export type ReviewMappingResult =
  | ReviewMappingOk
  | ReviewMappingFail;

async function filterByAllowlist(
  ids: string[],
): Promise<string[]> {
  if (ids.length === 0) return [];
  if (ids.length > ALLOWLIST_ID_COUNT_LIMIT) return [];
  const data = await getAllowlistDataOrLoad();
  return ids.filter((id) =>
    allowlistHas(data, 'concept', id)
  );
}

//
// Map review text to allowlist-valid concept IDs. LLM output is
// filtered to only allowed concept IDs; invalid ones are dropped.
//
export async function mapReviewTextToOntology(
  reviewText: string,
): Promise<ReviewMappingResult> {
  const llm = await ContentLlmService.mapReviewToConcepts(
    reviewText,
  );
  if (!llm.ok) {
    return { ok: false, status: 502, message: llm.error };
  }
  const valid = await filterByAllowlist(
    llm.output.concept_ids,
  );
  return {
    ok: true,
    concept_ids: valid,
    mapped_at: new Date().toISOString(),
  };
}
