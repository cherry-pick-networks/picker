//
// Orchestrator: utterance → { source_id, days }. Regex first; LLM fallback
// when regex fails. Optional short-TTL cache for LLM output.
//

import { parseDays } from './daysParser.ts';
import { matchSourceIdByKeyword } from '#api/storage/catalog/matcherConfig.ts';
import { getCachedOrFetch } from './utteranceParserServiceCache.ts';
import type { UtteranceParseResult } from './utteranceParserServiceTypes.ts';

export type {
  ParseFailure,
  ParseSuccess,
  UtteranceParseResult,
} from './utteranceParserServiceTypes.ts';

export {
  getLexisUtteranceCacheStats,
  resetLexisUtteranceCacheStats,
} from './utteranceParserServiceCache.ts';

function parseDaysAndSource(
  utterance: string,
  allowedSourceIds: Set<string>,
): UtteranceParseResult {
  const daysResult = parseDays(utterance);
  if (!daysResult.ok) {
    return { ok: false, reason: 'no_days' };
  }
  const sourceId = matchSourceIdByKeyword(
    utterance,
    allowedSourceIds,
  );
  return sourceId == null
    ? { ok: false, reason: 'unknown_source' }
    : {
      ok: true,
      source_id: sourceId,
      days: daysResult.days,
    };
}

export function parseUtterance(
  utterance: string,
  allowedSourceIds: Set<string>,
): UtteranceParseResult {
  const result = parseDaysAndSource(
    utterance,
    allowedSourceIds,
  );
  return result;
}

export async function parseUtteranceWithFallback(
  utterance: string,
  allowedSourceIds: Set<string>,
): Promise<UtteranceParseResult> {
  const sync = parseUtterance(utterance, allowedSourceIds);
  if (sync.ok) return sync;
  return await getCachedOrFetch(
    utterance,
    allowedSourceIds,
  );
}
