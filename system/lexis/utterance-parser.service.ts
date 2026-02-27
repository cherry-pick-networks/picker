/**
 * Orchestrator: utterance → { source_id, days }. Steps: days (regex) →
 * source (keyword table) → validate. LLM fallback stubbed for later.
 */

import { parseDays } from "./days-parser.ts";
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
