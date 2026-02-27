/**
 * Lexis utterance LLM client. Extracts source_id and days from utterance.
 * Uses OPENAI_API_KEY; LEXIS_UTTERANCE_LLM_MOCK for tests.
 */

import {
  type LexisUtteranceLlmOutput,
  LexisUtteranceLlmOutputSchema,
} from "./lexis-llm.schema.ts";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o";

export type LexisUtteranceLlmResult =
  | { ok: true; output: LexisUtteranceLlmOutput }
  | { ok: false; error: string };

const PROMPT =
  "From the utterance extract only the wordbook (source) and day numbers. " +
  "Return JSON only: source_id (English ID, e.g. lexis-middle-intermediate), " +
  "days (array of integers >= 1).";

// function-length-ignore — getter (store.md §P)
function getApiKey(): string | undefined {
  return Deno.env.get("OPENAI_API_KEY");
}

function getModel(): string {
  const m = Deno.env.get("LEXIS_UTTERANCE_LLM_MODEL");
  return m ?? DEFAULT_MODEL;
}

// function-length-ignore — single return (store.md §P)
function buildMessages(utterance: string): { role: string; content: string }[] {
  return [
    { role: "system", content: PROMPT },
    { role: "user", content: utterance },
  ];
}

async function parseChatContent(res: Response): Promise<string> {
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("LLM: no content");
  return content;
}

async function callChat(apiKey: string, utterance: string): Promise<string> {
  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages: buildMessages(utterance),
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM ${res.status}: ${t.slice(0, 200)}`);
  }
  return parseChatContent(res);
}

const MOCK_OUTPUT: LexisUtteranceLlmOutput = {
  source_id: "lexis-middle-intermediate",
  days: [1],
};

/**
 * Parse utterance to source_id and days via LLM. When LEXIS_UTTERANCE_LLM_MOCK
 * is set, returns fixed JSON without calling API.
 */
export async function parseUtteranceWithLlm(
  utterance: string,
): Promise<LexisUtteranceLlmResult> {
  if (Deno.env.get("LEXIS_UTTERANCE_LLM_MOCK")) {
    return { ok: true, output: MOCK_OUTPUT };
  }
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: "OPENAI_API_KEY not set" };
  try {
    const raw = await callChat(apiKey, utterance);
    const parsed = JSON.parse(raw) as unknown;
    const result = LexisUtteranceLlmOutputSchema.safeParse(parsed);
    if (!result.success) return { ok: false, error: result.error.message };
    return { ok: true, output: result.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
