//
// diagnoseLlmClient: mock returns fixed output; no API key returns error.
//

import { assertEquals } from '@std/assert';
import { diagnoseMisconception } from '#api/search/diagnoseLlmClient.ts';

Deno.test(
  'diagnoseMisconception with DIAGNOSE_MISCONCEPTION_LLM_MOCK returns fixed output',
  async () => {
    Deno.env.set('DIAGNOSE_MISCONCEPTION_LLM_MOCK', '1');
    try {
      const result = await diagnoseMisconception(
        'any student answer',
      );
      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(
          result.output.diagnosis,
          'Student confuses present simple with present continuous.',
        );
        assertEquals(result.output.concept_id, 'bloom-2');
      }
    } finally {
      Deno.env.delete('DIAGNOSE_MISCONCEPTION_LLM_MOCK');
    }
  },
);

Deno.test(
  'diagnoseMisconception without mock and no API key returns ok: false',
  async () => {
    const hadKey = Deno.env.get('OPENAI_API_KEY');
    Deno.env.delete('OPENAI_API_KEY');
    try {
      const result = await diagnoseMisconception('short');
      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(
          result.error,
          'OPENAI_API_KEY not set',
        );
      }
    } finally {
      if (hadKey !== undefined) {
        Deno.env.set('OPENAI_API_KEY', hadKey);
      }
    }
  },
);
