//
// Lexis utterance LLM client. Extracts source_id and days from utterance.
// Uses unified LLM client; LEXIS_UTTERANCE_LLM_MOCK for tests.
//

import {
  type LexisUtteranceLlmOutput,
  LexisUtteranceLlmOutputSchema,
} from './lexisLlmSchema.ts';
import { chat } from '#api/postgresql/llmClient.ts';

export type LexisUtteranceLlmResult =
  | { ok: true; output: LexisUtteranceLlmOutput }
  | { ok: false; error: string };

const PROMPT =
  'From the utterance extract only the wordbook (source) and day numbers. ' +
  'Return JSON only: source_id (English ID, e.g. lexis-middle-intermediate), ' +
  'days (array of integers >= 1).';

function buildMessages(utterance: string) {
  return [
    { role: 'system', content: PROMPT },
    { role: 'user', content: utterance },
  ];
}

const MOCK_OUTPUT: LexisUtteranceLlmOutput = {
  source_id: 'lexis-middle-intermediate',
  days: [1],
};

export async function parseUtteranceWithLlm(
  utterance: string,
): Promise<LexisUtteranceLlmResult> {
  if (Deno.env.get('LEXIS_UTTERANCE_LLM_MOCK')) {
    return { ok: true, output: MOCK_OUTPUT };
  }
  const result = await chat(
    'lexis_utterance',
    buildMessages(utterance),
  );
  if (!result.ok) return { ok: false, error: result.error };
  try {
    const parsed = JSON.parse(result.content) as unknown;
    const out = LexisUtteranceLlmOutputSchema.safeParse(
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
