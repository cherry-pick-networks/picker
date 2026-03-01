//
// LLM client: review text → concept IDs (ontology mapping).
// Uses unified LLM client; REVIEW_MAPPING_LLM_MOCK for tests.
//

import {
  type ReviewMappingLlmOutput,
  ReviewMappingLlmOutputSchema,
} from './mappingSchema.ts';
import { chat } from '#api/postgresql/llmClient.ts';

export type ReviewMappingLlmResult =
  | { ok: true; output: ReviewMappingLlmOutput }
  | { ok: false; error: string };

function buildMessages(reviewText: string) {
  const system =
    'You return only valid JSON with key: concept_ids (array of ' +
    'concept IDs from the curriculum ontology that best match the ' +
    'review). Use only IDs from: isced, iscedf, bloom, cefr, actfl, ' +
    'doctype (e.g. bloom-1, iscedf-02). Return empty array if none.';
  const user =
    `Review text:\n${reviewText}\n\nReturn JSON: { "concept_ids": [...] }.`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

const MOCK_OUTPUT: ReviewMappingLlmOutput = {
  concept_ids: ['bloom-1'],
};

export async function mapReviewToConcepts(
  reviewText: string,
): Promise<ReviewMappingLlmResult> {
  if (Deno.env.get('REVIEW_MAPPING_LLM_MOCK')) {
    return { ok: true, output: MOCK_OUTPUT };
  }
  const result = await chat(
    'review_mapping',
    buildMessages(reviewText),
  );
  if (!result.ok) return { ok: false, error: result.error };
  try {
    const parsed = JSON.parse(result.content) as unknown;
    const out = ReviewMappingLlmOutputSchema.safeParse(
      parsed,
    );
    if (!out.success) {
      return { ok: false, error: out.error.message };
    }
    return { ok: true, output: out.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
