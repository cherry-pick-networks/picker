//
// Source-domain LLM client. Extracts concept/subject IDs from passage body.
// Uses unified LLM client; SOURCE_EXTRACT_LLM_MOCK for tests.
//

import {
  type SourceExtractOutput,
  SourceExtractOutputSchema,
} from './sourceSchema.ts';
import { chat } from '#api/postgresql/services/llmClient.ts';

export type SourceExtractLlmResult =
  | { ok: true; output: SourceExtractOutput }
  | { ok: false; error: string };

function buildMessages(body: string) {
  const system =
    'You return only valid JSON with keys: concept_ids (array of concept ' +
    'IDs), optional subject_id.';
  const user =
    `Passage:\n${body}\n\nReturn the one exam subject ID and array of ` +
    'concept IDs for the above passage as JSON only.';
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

const MOCK_OUTPUT: SourceExtractOutput = {
  concept_ids: ['bloom-1'],
  subject_id: 'iscedf-02',
};

export async function extractConcepts(
  body: string,
): Promise<SourceExtractLlmResult> {
  if (Deno.env.get('SOURCE_EXTRACT_LLM_MOCK')) {
    return { ok: true, output: MOCK_OUTPUT };
  }
  const result = await chat(
    'source_extract',
    buildMessages(body),
  );
  if (!result.ok) return { ok: false, error: result.error };
  try {
    const parsed = JSON.parse(result.content) as unknown;
    const out = SourceExtractOutputSchema.safeParse(parsed);
    if (!out.success) {
      return { ok: false, error: out.error.message };
    }
    return { ok: true, output: out.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
