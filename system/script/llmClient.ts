/**
 * Script-domain LLM wrapper. Calls external API via fetch; API key from env.
 * Structured output shape (MutateOutput) is defined in mutateSchema.
 */

import { type MutateOutput, MutateOutputSchema } from '#system/script/mutateSchema.ts';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export type MutateLlmInput = {
  snippet: string;
  intent?: string;
};

export type MutateLlmResult =
  | { ok: true; output: MutateOutput }
  | { ok: false; error: string };

// function-length-ignore
function getApiKey(): string | undefined {
  return Deno.env.get('OPENAI_API_KEY');
}

type ChatMessage = { role: string; content: string };

function buildMessages(input: MutateLlmInput): ChatMessage[] {
  const system = 'You return only valid JSON with keys: original (exact input snippet), ' +
    'mutated.';
  const user = input.intent
    ? `Intent: ${input.intent}\nSnippet:\n${input.snippet}`
    : `Snippet:\n${input.snippet}`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

async function parseChatContent(res: Response): Promise<string> {
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('LLM: no content');
  return content;
}

async function callChat(
  apiKey: string,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM ${res.status}: ${t.slice(0, 200)}`);
  }
  return parseChatContent(res);
}

/**
 * Request mutate output for a snippet; optional intent. Parses and validates
 * with MutateOutputSchema. When MUTATE_LLM_MOCK is set (e.g. in tests),
 * returns a stub without calling the API.
 */
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
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: 'OPENAI_API_KEY not set' };
  const messages = buildMessages(input);
  try {
    const raw = await callChat(apiKey, messages);
    const parsed = JSON.parse(raw) as unknown;
    const result = MutateOutputSchema.safeParse(parsed);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, output: result.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
