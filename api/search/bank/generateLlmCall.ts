//
// LLM call helper for dynamic item generation: build messages, fetch, parse.
//

const OPENAI_CHAT_URL =
  'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o';

export function getItemGenerateApiKey():
  | string
  | undefined {
  return Deno.env.get('OPENAI_API_KEY');
}

function getModel(): string {
  const m = Deno.env.get('DYNAMIC_ITEM_LLM_MODEL');
  return m ?? DEFAULT_MODEL;
}

export function buildItemGenerateMessages(
  conceptLabels: string[],
  count: number,
): { role: string; content: string }[] {
  const system =
    'You return only valid JSON: { "items": [ { "stem", "options", ' +
    '"correct", "explanation"? } ] }. One multiple-choice item per object.';
  const user =
    `Concepts to fuse (2–3): ${
      conceptLabels.join(', ')
    }. ` +
    `Generate exactly ${count} item(s). Return JSON only.`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export async function parseItemGenerateContent(
  res: Response,
): Promise<string> {
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('LLM: no content');
  }
  return content;
}

export async function callItemGenerateChat(
  apiKey: string,
  conceptLabels: string[],
  count: number,
): Promise<string> {
  const messages = buildItemGenerateMessages(
    conceptLabels,
    count,
  );
  const res = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      `LLM ${res.status}: ${t.slice(0, 200)}`,
    );
  }
  return parseItemGenerateContent(res);
}
