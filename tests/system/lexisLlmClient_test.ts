/**
 * lexisLlmClient: mock returns fixed output; no API key returns error.
 */

import { assertEquals } from '@std/assert';
import { parseUtteranceWithLlm } from '#system/lexis/lexisLlmClient.ts';

Deno.test(
  'parseUtteranceWithLlm with LEXIS_UTTERANCE_LLM_MOCK returns fixed output',
  async () => {
    Deno.env.set('LEXIS_UTTERANCE_LLM_MOCK', '1');
    try {
      const result = await parseUtteranceWithLlm('any utterance');
      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.output.source_id, 'lexis-middle-intermediate');
        assertEquals(result.output.days, [1]);
      }
    } finally {
      Deno.env.delete('LEXIS_UTTERANCE_LLM_MOCK');
    }
  },
);

Deno.test(
  'parseUtteranceWithLlm without mock and no API key returns ok: false',
  async () => {
    const hadKey = Deno.env.get('OPENAI_API_KEY');
    Deno.env.delete('OPENAI_API_KEY');
    try {
      const result = await parseUtteranceWithLlm('wordbook 1일차');
      assertEquals(result.ok, false);
      if (!result.ok) assertEquals(result.error, 'OPENAI_API_KEY not set');
    } finally {
      if (hadKey !== undefined) Deno.env.set('OPENAI_API_KEY', hadKey);
    }
  },
);
