/**
 * Orchestrator: utterance → { source_id, days }. Regex first; LLM fallback
 * when regex fails. Optional short-TTL cache for LLM output.
 */

import type { LexisUtteranceLlmOutput } from './lexisLlmSchema.ts';
import { parseDays } from './daysParser.ts';
import { parseUtteranceWithLlm } from './lexisLlmClient.ts';
import { matchSourceIdByKeyword } from './sourceMatcherConfig.ts';

const CACHE = new Map<
  string,
  { value: LexisUtteranceLlmOutput; expiresAt: number }
>();
let cacheHits = 0;
let cacheMisses = 0;

// function-length-ignore — getter (store.md §P)
export function getLexisUtteranceCacheStats(): {
  hits: number;
  misses: number;
} {
  return { hits: cacheHits, misses: cacheMisses };
}

export function resetLexisUtteranceCacheStats(): void {
  CACHE.clear();
  cacheHits = 0;
  cacheMisses = 0;
}

function cacheTtlSec(): number {
  const s = Deno.env.get('LEXIS_UTTERANCE_CACHE_TTL_SEC');
  if (s == null || s === '') return 60;
  const n = parseInt(s, 10);
  return Number.isInteger(n) && n >= 0 ? n : 60;
}

// function-length-ignore — one-liner (store.md §P)
function cacheKey(utterance: string): string {
  return utterance.trim().replace(/\s+/g, ' ');
}

export type ParseSuccess = {
  ok: true;
  source_id: string;
  days: number[];
};

export type ParseFailure = {
  ok: false;
  reason: 'no_days' | 'unknown_source' | 'parse_error';
};

export type UtteranceParseResult = ParseSuccess | ParseFailure;

// function-length-ignore — 4 branches for two validations (store.md §P)
export function parseUtterance(
  utterance: string,
  allowedSourceIds: Set<string>,
): UtteranceParseResult {
  const daysResult = parseDays(utterance);
  if (!daysResult.ok) return { ok: false, reason: 'no_days' };
  const sourceId = matchSourceIdByKeyword(utterance, allowedSourceIds);
  if (sourceId == null) return { ok: false, reason: 'unknown_source' };
  return { ok: true, source_id: sourceId, days: daysResult.days };
}

function normalizeDays(days: number[]): number[] {
  const valid = days.filter((n) => Number.isInteger(n) && n >= 1);
  return [...new Set(valid)].sort((a, b) => a - b);
}

function fromLlmOutput(
  out: LexisUtteranceLlmOutput,
  allowedSourceIds: Set<string>,
): UtteranceParseResult {
  if (!allowedSourceIds.has(out.source_id)) {
    return { ok: false, reason: 'unknown_source' };
  }
  const days = normalizeDays(out.days);
  if (days.length === 0) return { ok: false, reason: 'no_days' };
  return { ok: true, source_id: out.source_id, days };
}

/** Async: regex first; on failure LLM (or cache), validate, normalize days. */
export async function parseUtteranceWithFallback(
  utterance: string,
  allowedSourceIds: Set<string>,
): Promise<UtteranceParseResult> {
  const sync = parseUtterance(utterance, allowedSourceIds);
  if (sync.ok) return sync;
  const key = cacheKey(utterance);
  const now = Date.now();
  const entry = CACHE.get(key);
  if (entry && entry.expiresAt > now) {
    cacheHits++;
    return fromLlmOutput(entry.value, allowedSourceIds);
  }
  cacheMisses++;
  const llm = await parseUtteranceWithLlm(utterance);
  if (!llm.ok) return { ok: false, reason: 'parse_error' };
  const ttl = cacheTtlSec();
  if (ttl > 0) {
    CACHE.set(key, {
      value: llm.output,
      expiresAt: now + ttl * 1000,
    });
  }
  return fromLlmOutput(llm.output, allowedSourceIds);
}
