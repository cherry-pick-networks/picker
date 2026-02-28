/**
 * Source-domain LLM client. Extracts concept/subject IDs from passage body.
 * Uses OPENAI_API_KEY; SOURCE_EXTRACT_LLM_MOCK for tests.
 */

import {
  type SourceExtractOutput,
  SourceExtractOutputSchema,
} from "#system/source/sourceSchema.ts";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

const DEFAULT_MODEL = "gpt-4o";

export type SourceExtractLlmResult =
  | { ok: true; output: SourceExtractOutput }
  | { ok: false; error: string };

function getApiKey(): string | undefined {
  const k = Deno.env.get("OPENAI_API_KEY");
  return k;
}

function getModel(): string {
  const m = Deno.env.get("SOURCE_EXTRACT_LLM_MODEL");
  return m ?? DEFAULT_MODEL;
}

function buildMessages(body: string): { role: string; content: string }[] {
  const system =
    "You return only valid JSON with keys: concept_ids (array of concept " +
    "IDs), optional subject_id.";
  const user =
    `Passage:\n${body}\n\nReturn the one exam subject ID and array of ` +
    "concept IDs for the above passage as JSON only.";
  return [
    { role: "system", content: system },
    { role: "user", content: user },
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

async function callChat(
  apiKey: string,
  body: string,
): Promise<string> {
  const messages = buildMessages(body);
  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM ${res.status}: ${t.slice(0, 200)}`);
  }
  return parseChatContent(res);
}

/** Fixed mock output when SOURCE_EXTRACT_LLM_MOCK is set (allowlist codes). */
const MOCK_OUTPUT: SourceExtractOutput = {
  concept_ids: ["bloom-1"],
  subject_id: "iscedf-02",
};

/**
 * Extract concept and optional subject IDs from passage body via LLM.
 * When SOURCE_EXTRACT_LLM_MOCK is set, returns fixed JSON without calling API.
 */
export async function extractConcepts(
  body: string,
): Promise<SourceExtractLlmResult> {
  if (Deno.env.get("SOURCE_EXTRACT_LLM_MOCK")) {
    return { ok: true, output: MOCK_OUTPUT };
  }
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: "OPENAI_API_KEY not set" };
  try {
    const raw = await callChat(apiKey, body);
    const parsed = JSON.parse(raw) as unknown;
    const result = SourceExtractOutputSchema.safeParse(parsed);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, output: result.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
