//  Utterance parser cache: TTL, key, normalize, fromLlmOutput. Used by utteranceParserServiceCache.

import type { LexisUtteranceLlmOutput } from '#api/storage/catalog/lexisLlmSchema.ts';
import type { UtteranceParseResult } from './utteranceParserServiceTypes.ts';

export function cacheTtlSec(): number {
  const s = Deno.env.get('LEXIS_UTTERANCE_CACHE_TTL_SEC');
  if (s == null || s === '') return 60;
  const n = parseInt(s, 10);
  return Number.isInteger(n) && n >= 0 ? n : 60;
}

export function cacheKey(utterance: string): string {
  return utterance.trim().replace(/\s+/g, ' ');
}

export function normalizeDays(days: number[]): number[] {
  const valid = days.filter((n) =>
    Number.isInteger(n) && n >= 1
  );
  return [...new Set(valid)].sort((a, b) => a - b);
}

export function fromLlmOutput(
  out: LexisUtteranceLlmOutput,
  allowedSourceIds: Set<string>,
): UtteranceParseResult {
  if (!allowedSourceIds.has(out.source_id)) {
    return { ok: false, reason: 'unknown_source' };
  }
  const days = normalizeDays(out.days);
  if (days.length === 0) {
    return { ok: false, reason: 'no_days' };
  }
  return { ok: true, source_id: out.source_id, days };
}
