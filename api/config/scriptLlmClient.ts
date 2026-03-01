//
// Script-domain LLM wrapper. Uses unified LLM client; MUTATE_LLM_MOCK for tests.
//

import {
  type MutateOutput,
  MutateOutputSchema,
} from './mutateSchema.ts';
import { chat } from '#api/postgresql/services/llmClient.ts';

export type MutateLlmInput = {
  snippet: string;
  intent?: string;
};

export type MutateLlmResult =
  | { ok: true; output: MutateOutput }
  | { ok: false; error: string };

function buildMessages(input: MutateLlmInput) {
  const system =
    'You return only valid JSON with keys: original (exact input snippet), ' +
    'mutated.';
  const user = input.intent
    ? `Intent: ${input.intent}\nSnippet:\n${input.snippet}`
    : `Snippet:\n${input.snippet}`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export async function mutateViaLlm(
  input: MutateLlmInput,
): Promise<MutateLlmResult> {
  if (Deno.env.get('MUTATE_LLM_MOCK')) {
    return {
      ok: true,
      output: {
        original: input.snippet,
        mutated: input.snippet + '\n// mutated',
      },
    };
  }
  const result = await chat(
    'script_mutate',
    buildMessages(input),
  );
  if (!result.ok) return { ok: false, error: result.error };
  try {
    const parsed = JSON.parse(result.content) as unknown;
    const out = MutateOutputSchema.safeParse(parsed);
    if (!out.success) {
      return { ok: false, error: out.error.message };
    }
    return { ok: true, output: out.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
