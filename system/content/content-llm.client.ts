/**
 * Content-domain LLM client. Generates one grammar item (usage §4) via 4o.
 * Uses OPENAI_API_KEY; CONTENT_GENERATE_LLM_MOCK for tests.
 */

import { z } from "zod";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

const DEFAULT_MODEL = "gpt-4o";

export const GrammarItemLlmOutputSchema = z.object({
  passage: z.string(),
  question: z.string(),
  choices: z.array(z.string()).length(5),
  correct_index: z.number().min(0).max(4),
  explanation: z.string(),
});
export type GrammarItemLlmOutput = z.infer<typeof GrammarItemLlmOutputSchema>;

export type GenerateGrammarItemResult =
  | { ok: true; output: GrammarItemLlmOutput }
  | { ok: false; error: string };

const SYSTEM_PROMPT =
  "Grammar/vocabulary inference item (usage §4): passage with underlined " +
  "parts, one grammatically incorrect. Output only valid JSON with keys: " +
  "passage, question, choices (array of 5 strings), correct_index (0–4), " +
  "explanation.";

function getApiKey(): string | undefined {
  const k = Deno.env.get("OPENAI_API_KEY");
  return k;
}

function getModel(): string {
  const m = Deno.env.get("CONTENT_GENERATE_LLM_MODEL");
  return m ?? DEFAULT_MODEL;
}

function buildMessages(
  topicLabel: string,
): { role: string; content: string }[] {
  const user =
    `Topic: ${topicLabel}. Difficulty: Medium. Generate one grammar item.`;
  return [
    { role: "system", content: SYSTEM_PROMPT },
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

async function callChat(apiKey: string, topicLabel: string): Promise<string> {
  const messages = buildMessages(topicLabel);
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

const MOCK_OUTPUT: GrammarItemLlmOutput = {
  passage: "Mock passage with ① **do** and ② **it**.",
  question: "Which underlined part is grammatically incorrect?",
  choices: ["do", "it", "option3", "option4", "option5"],
  correct_index: 0,
  explanation: "Mock explanation.",
};

/**
 * Generate one grammar item via LLM. When CONTENT_GENERATE_LLM_MOCK is set,
 * returns fixed JSON without calling API.
 */
export async function generateGrammarItem(
  topicLabel: string,
): Promise<GenerateGrammarItemResult> {
  if (Deno.env.get("CONTENT_GENERATE_LLM_MOCK")) {
    return { ok: true, output: MOCK_OUTPUT };
  }
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: "OPENAI_API_KEY not set" };
  try {
    const raw = await callChat(apiKey, topicLabel);
    const parsed = JSON.parse(raw) as unknown;
    const result = GrammarItemLlmOutputSchema.safeParse(parsed);
    if (!result.success) return { ok: false, error: result.error.message };
    return { ok: true, output: result.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
