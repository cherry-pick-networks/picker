//
// LLM client for dynamic item generation. Uses unified LLM client;
// DYNAMIC_ITEM_LLM_MOCK for tests.
//

import {
  type ItemGenerateLlmOutput,
  ItemGenerateLlmOutputSchema,
} from './generateLlmSchema.ts';
import { buildItemGenerateMessages } from './generateLlmCall.ts';
import { chat } from '#system/infra/llmClient.ts';

export type ItemGenerateLlmResult =
  | { ok: true; output: ItemGenerateLlmOutput }
  | { ok: false; error: string };

const MOCK_OUTPUT: ItemGenerateLlmOutput = {
  items: [
    {
      stem: 'Sample stem (mock).',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'Mock explanation.',
    },
  ],
};

function parseItemGenerateResult(
  content: string,
): ItemGenerateLlmResult {
  try {
    const parsed = JSON.parse(content) as unknown;
    const out = ItemGenerateLlmOutputSchema.safeParse(
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

export async function generateItemsViaLlm(
  conceptLabels: string[],
  count: number,
): Promise<ItemGenerateLlmResult> {
  if (Deno.env.get('DYNAMIC_ITEM_LLM_MOCK')) {
    return {
      ok: true,
      output: {
        ...MOCK_OUTPUT,
        items: MOCK_OUTPUT.items.slice(0, count),
      },
    };
  }
  const result = await chat(
    'item_generate',
    buildItemGenerateMessages(conceptLabels, count),
  );
  if (!result.ok) return { ok: false, error: result.error };
  return parseItemGenerateResult(result.content);
}
