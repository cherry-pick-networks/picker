//
// LLM HTTP call and message build for curriculum mapping (single call).
//

const OPENAI_CHAT_URL =
  'https://api.openai.com/v1/chat/completions';

function buildMessages(
  dumpText: string,
  nationalStandard: string,
): { role: string; content: string }[] {
  const system =
    'You return only valid JSON. Keys: national_standard (string), level ' +
    '(string), mappings (array of { internal: { unit_id, week_number?, ' +
    'slot_index?, source_id? }, external: { code, label? } }). ' +
    'Map each internal curriculum slot to the given external standard.';
  const user = 'External standard: ' + nationalStandard +
    '\n\nInternal curriculum ' +
    'dump:\n' + dumpText +
    '\n\nReturn the mapping JSON only.';
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

async function parseContent(
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

//  Single LLM request; returns raw JSON string.
export async function doLlmCall(
  apiKey: string,
  model: string,
  dumpText: string,
  nationalStandard: string,
): Promise<string> {
  const messages = buildMessages(
    dumpText,
    nationalStandard,
  );
  const res = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
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
  return parseContent(res);
}
