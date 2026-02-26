/**
 * Generate grammar items by topic (usage §4). LLM → Item → store.
 * No dependency on schedule/source; topic_label from client or shared map.
 */

import type {
  CreateItemRequest,
  GenerateItemsRequest,
  Item,
} from "./content.schema.ts";
import type { GrammarItemLlmOutput } from "./content-llm.client.ts";
import { generateGrammarItem } from "./content-llm.client.ts";
import {
  getTopicLabel,
  loadGrammarUnitTopics,
} from "./grammar-unit-topics.loader.ts";
import { createItem } from "./content.service.ts";

const DEFAULT_QUESTION_TYPE = "Grammar inference";
const DEFAULT_COUNT = 1;

export type GenerateItemsResult =
  | { ok: true; items: Item[] }
  | { ok: false; status: 400 | 502; message: string };

function llmToCreateRequest(
  out: GrammarItemLlmOutput,
  req: GenerateItemsRequest,
): CreateItemRequest {
  const qt = req.question_type ?? DEFAULT_QUESTION_TYPE;
  const stem = `${out.passage}\n\n${out.question}`;
  return {
    stem,
    options: out.choices,
    correct: out.correct_index + 1,
    difficulty: "Medium",
    source: req.source_id,
    parameters: {
      explanation: out.explanation,
      topic_label: req.topic_label ?? "",
      question_type: qt,
      source_id: req.source_id,
      unit_id: req.unit_id,
    },
  };
}

// function-length-ignore
async function resolveTopicLabel(
  unitId: string,
  given?: string,
): Promise<string> {
  if (given != null && given.length > 0) return given;
  const topics = await loadGrammarUnitTopics();
  const label = getTopicLabel(topics, unitId);
  if (label == null) throw new Error(`No topic_label for unit_id: ${unitId}`);
  return label;
}

// function-length-ignore
export async function generateItems(
  req: GenerateItemsRequest,
): Promise<GenerateItemsResult> {
  const count = Math.min(Math.max(1, req.count ?? DEFAULT_COUNT), 10);
  let topicLabel: string;
  try {
    topicLabel = await resolveTopicLabel(req.unit_id, req.topic_label);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 400, message: msg };
  }
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    const llm = await generateGrammarItem(topicLabel);
    if (!llm.ok) {
      return { ok: false, status: 502, message: llm.error };
    }
    const body = llmToCreateRequest(llm.output, {
      ...req,
      topic_label: topicLabel,
    });
    const item = await createItem(body);
    items.push(item);
  }
  return { ok: true, items };
}
