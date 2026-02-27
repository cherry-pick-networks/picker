/**
 * Orchestrator: utterance → { source_id, days }. Regex first; LLM fallback
 * when regex fails.
 */

import { parseDays } from "./days-parser.ts";
import { parseUtteranceWithLlm } from "./lexis-llm.client.ts";
import { matchSourceIdByKeyword } from "./source-matcher.config.ts";

export type ParseSuccess = {
  ok: true;
  source_id: string;
  days: number[];
};

export type ParseFailure = {
  ok: false;
  reason: "no_days" | "unknown_source" | "parse_error";
};

export type UtteranceParseResult = ParseSuccess | ParseFailure;

// function-length-ignore — 4 branches for two validations (store.md §P)
export function parseUtterance(
  utterance: string,
  allowedSourceIds: Set<string>,
): UtteranceParseResult {
  const daysResult = parseDays(utterance);
  if (!daysResult.ok) return { ok: false, reason: "no_days" };
  const sourceId = matchSourceIdByKeyword(utterance, allowedSourceIds);
  if (sourceId == null) return { ok: false, reason: "unknown_source" };
  return { ok: true, source_id: sourceId, days: daysResult.days };
}

function normalizeDays(days: number[]): number[] {
  const valid = days.filter((n) => Number.isInteger(n) && n >= 1);
  return [...new Set(valid)].sort((a, b) => a - b);
}

/** Async: regex first; on failure call LLM and validate source_id, normalize days. */
export async function parseUtteranceWithFallback(
  utterance: string,
  allowedSourceIds: Set<string>,
): Promise<UtteranceParseResult> {
  const sync = parseUtterance(utterance, allowedSourceIds);
  if (sync.ok) return sync;
  const llm = await parseUtteranceWithLlm(utterance);
  if (!llm.ok) return { ok: false, reason: "parse_error" };
  if (!allowedSourceIds.has(llm.output.source_id)) {
    return { ok: false, reason: "unknown_source" };
  }
  const days = normalizeDays(llm.output.days);
  if (days.length === 0) return { ok: false, reason: "no_days" };
  return { ok: true, source_id: llm.output.source_id, days };
}
