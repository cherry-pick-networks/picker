//
// itemGenerateLlmClient: mock returns fixed output; no API key returns error.
//

import { assertEquals } from '@std/assert';
import { generateItemsViaLlm } from '#api/search/bankGenerateLlmClient.ts';

Deno.test(
  'generateItemsViaLlm with DYNAMIC_ITEM_LLM_MOCK returns fixed output',
  async () => {
    Deno.env.set('DYNAMIC_ITEM_LLM_MOCK', '1');
    try {
      const result = await generateItemsViaLlm(
        ['Remember', 'Understand'],
        1,
      );
      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.output.items.length, 1);
        assertEquals(
          result.output.items[0].stem,
          'Sample stem (mock).',
        );
        assertEquals(result.output.items[0].correct, 0);
      }
    } finally {
      Deno.env.delete('DYNAMIC_ITEM_LLM_MOCK');
    }
  },
);

Deno.test(
  'generateItemsViaLlm without mock and no API key returns ok: false',
  async () => {
    const hadKey = Deno.env.get('OPENAI_API_KEY');
    Deno.env.delete('OPENAI_API_KEY');
    try {
      const result = await generateItemsViaLlm(
        ['A', 'B'],
        1,
      );
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
