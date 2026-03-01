//
// Raw LLM call for misconception diagnosis. Used by diagnoseLlmClient.
//

const OPENAI_CHAT_URL =
  'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o';

function getModel(): string {
  return Deno.env.get('DIAGNOSE_MISCONCEPTION_LLM_MODEL') ??
    DEFAULT_MODEL;
}

function buildMessages(
  responseText: string,
): { role: string; content: string }[] {
  const system =
    'You return only valid JSON with keys: diagnosis (string, one ' +
    'sentence describing the misconception or cognitive error), optional ' +
    'concept_id (single concept ID from Bloom/CEFR/ACTFL/doctype if ' +
    'applicable).';
  const user =
    `Student response or selected wrong option:\n${responseText}\n\n` +
    'Return the misconception diagnosis as JSON only.';
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

async function parseChatContent(
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

export async function callDiagnoseLlm(
  apiKey: string,
  responseText: string,
): Promise<string> {
  const messages = buildMessages(responseText);
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
  return parseChatContent(res);
}
