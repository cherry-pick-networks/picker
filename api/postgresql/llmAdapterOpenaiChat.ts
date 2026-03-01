//  OpenAI adapter: chat via api.openai.com. Used by llmAdapterOpenai.ts.

import type { ChatMessage } from './llmTypes.ts';

const CHAT_URL =
  'https://api.openai.com/v1/chat/completions';

function parseChatContent(
  data: { choices?: { message?: { content?: string } }[] },
): string {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('LLM: no content');
  }
  return content;
}

async function chatFetch(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}

async function ensureChatResOk(
  res: Response,
): Promise<void> {
  if (res.ok) return;
  const t = await res.text();
  throw new Error(`LLM ${res.status}: ${t.slice(0, 200)}`);
}

function buildChatBody(
  modelId: string,
  messages: ChatMessage[],
  options?: { responseFormat?: 'json_object' },
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: modelId,
    messages,
  };
  if (options?.responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' };
  }
  return body;
}

async function parseChatRes(
  res: Response,
): Promise<Parameters<typeof parseChatContent>[0]> {
  await ensureChatResOk(res);
  return (await res.json()) as Parameters<
    typeof parseChatContent
  >[0];
}

export async function chat(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  options?: { responseFormat?: 'json_object' },
): Promise<string> {
  const body = buildChatBody(modelId, messages, options);
  const res = await chatFetch(apiKey, body);
  const data = await parseChatRes(res);
  return parseChatContent(data);
}
